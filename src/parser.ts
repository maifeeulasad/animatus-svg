/**
 * SVG Parser - Analyzes SVG structure and elements
 */

import { ParsedElement, SVGElementType } from './types';

// Elements that can be animated
const ANIMATABLE_ELEMENTS = [
  'path', 'circle', 'ellipse', 'rect', 'line', 
  'polyline', 'polygon', 'text', 'tspan', 'g', 'use', 'image'
];

/**
 * Determine the type of SVG element
 */
export function getElementType(element: Element): SVGElementType {
  const tagName = element.tagName.toLowerCase();
  
  if (ANIMATABLE_ELEMENTS.includes(tagName)) {
    return tagName as SVGElementType;
  }
  
  return 'unknown';
}

/**
 * Calculate path length for stroke animations
 */
export function getPathLength(element: SVGElement): number | undefined {
  if (element instanceof SVGGeometryElement) {
    try {
      return element.getTotalLength();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Get element bounding box safely
 */
export function getElementBounds(element: SVGElement): DOMRect | undefined {
  try {
    if ('getBBox' in element) {
      const bbox = (element as SVGGraphicsElement).getBBox();
      return new DOMRect(bbox.x, bbox.y, bbox.width, bbox.height);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Generate unique ID for element if none exists
 */
function generateElementId(element: SVGElement, index: number): string {
  return element.id || `svg-anim-${index}`;
}

/**
 * Check if element has visible stroke
 */
export function hasStroke(element: SVGElement): boolean {
  const stroke = element.getAttribute('stroke');
  const strokeWidth = element.getAttribute('stroke-width');
  const style = window.getComputedStyle(element);
  
  const hasStrokeAttr = stroke && stroke !== 'none';
  const hasStrokeStyle = style.stroke && style.stroke !== 'none';
  const hasWidth = strokeWidth !== '0' && style.strokeWidth !== '0px';
  
  return (hasStrokeAttr || hasStrokeStyle) && hasWidth !== false;
}

/**
 * Check if element has visible fill
 */
export function hasFill(element: SVGElement): boolean {
  const fill = element.getAttribute('fill');
  const style = window.getComputedStyle(element);
  
  const hasFillAttr = fill && fill !== 'none';
  const hasFillStyle = style.fill && style.fill !== 'none';
  
  return hasFillAttr || hasFillStyle;
}

/**
 * Parse SVG and extract animatable elements
 */
export function parseSVG(svg: SVGElement): ParsedElement[] {
  const elements: ParsedElement[] = [];
  let index = 0;
  
  function traverse(parent: Element, depth: number = 0): ParsedElement[] {
    const result: ParsedElement[] = [];
    
    for (const child of Array.from(parent.children)) {
      const type = getElementType(child);
      
      if (type === 'unknown') {
        // Skip non-animatable elements but traverse their children
        if (child.children.length > 0) {
          result.push(...traverse(child, depth));
        }
        continue;
      }
      
      const svgElement = child as SVGElement;
      const parsed: ParsedElement = {
        element: svgElement,
        type,
        id: generateElementId(svgElement, index),
        index: index++,
        pathLength: getPathLength(svgElement),
        bounds: getElementBounds(svgElement),
      };
      
      // Parse children for groups
      if (type === 'g' && child.children.length > 0) {
        parsed.children = traverse(child, depth + 1);
      }
      
      result.push(parsed);
    }
    
    return result;
  }
  
  // Start parsing from SVG root
  elements.push(...traverse(svg));
  
  return elements;
}

/**
 * Flatten parsed elements (including nested group children)
 */
export function flattenElements(elements: ParsedElement[]): ParsedElement[] {
  const result: ParsedElement[] = [];
  
  function flatten(items: ParsedElement[]) {
    for (const item of items) {
      result.push(item);
      if (item.children) {
        flatten(item.children);
      }
    }
  }
  
  flatten(elements);
  return result;
}

/**
 * Sort elements by visual order (top-to-bottom, left-to-right)
 */
export function sortByVisualOrder(elements: ParsedElement[]): ParsedElement[] {
  return [...elements].sort((a, b) => {
    if (!a.bounds || !b.bounds) return 0;
    
    // Primary sort by Y position
    const yDiff = a.bounds.y - b.bounds.y;
    if (Math.abs(yDiff) > 10) return yDiff;
    
    // Secondary sort by X position
    return a.bounds.x - b.bounds.x;
  });
}

/**
 * Group elements by type
 */
export function groupByType(elements: ParsedElement[]): Map<SVGElementType, ParsedElement[]> {
  const groups = new Map<SVGElementType, ParsedElement[]>();
  
  for (const element of elements) {
    const existing = groups.get(element.type) || [];
    existing.push(element);
    groups.set(element.type, existing);
  }
  
  return groups;
}
