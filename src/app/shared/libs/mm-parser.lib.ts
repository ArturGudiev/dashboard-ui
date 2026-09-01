import { randomId } from '../../utils/id.utils';

export interface MmNode {
  id: string;
  text: string;
  folded: boolean;
  link?: string;
  note?: string;
  children: MmNode[];
}

/** Parse Freeplane / FreeMind `.mm` XML into a tree (skips style nodes). */
export function parseMindMapXml(xml: string): MmNode {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid mind map XML');
  }

  const map = doc.querySelector('map');
  if (!map) {
    throw new Error('Mind map root <map> not found');
  }

  const rootEl = Array.from(map.children).find((el) => el.tagName === 'node');
  if (!rootEl) {
    throw new Error('Mind map has no root <node>');
  }

  return parseNodeElement(rootEl);
}

function parseNodeElement(el: Element): MmNode {
  const children = Array.from(el.children)
    .filter((child) => child.tagName === 'node')
    .map((child) => parseNodeElement(child));

  const text = nodeText(el);
  const foldedAttr = el.getAttribute('FOLDED');
  const folded =
    foldedAttr === 'true' ||
    // Default: fold branches that have children when attribute omitted on deep trees? Freeplane usually sets FOLDED.
    // Keep open when omitted so small maps stay visible; large maps use FOLDED on branches.
    false;

  const link = el.getAttribute('LINK') || undefined;
  const note = noteText(el);

  return {
    id: el.getAttribute('ID') || randomId(),
    text: text || '(untitled)',
    folded,
    link,
    note,
    children,
  };
}

function nodeText(el: Element): string {
  const attr = el.getAttribute('TEXT');
  if (attr != null && attr !== '') {
    return attr;
  }

  const rich = Array.from(el.children).find(
    (c) => c.tagName === 'richcontent' && c.getAttribute('TYPE') === 'NODE',
  );
  if (rich) {
    return (rich.textContent || '').trim();
  }

  return el.getAttribute('LOCALIZED_TEXT') || '';
}

function noteText(el: Element): string | undefined {
  const rich = Array.from(el.children).find(
    (c) => c.tagName === 'richcontent' && c.getAttribute('TYPE') === 'NOTE',
  );
  if (!rich) {
    return undefined;
  }
  const text = (rich.textContent || '').trim();
  return text || undefined;
}

export function setAllFolded(node: MmNode, folded: boolean): MmNode {
  return {
    ...node,
    folded: node.children.length > 0 ? folded : false,
    children: node.children.map((child) => setAllFolded(child, folded)),
  };
}

export function toggleFoldedAt(node: MmNode, id: string): MmNode {
  if (node.id === id) {
    return { ...node, folded: !node.folded };
  }
  return {
    ...node,
    children: node.children.map((child) => toggleFoldedAt(child, id)),
  };
}
