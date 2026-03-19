import { isValidElement, type ReactNode } from 'react'

/**
 * React children 트리를 재귀 순회하여 텍스트를 추출한다.
 * CodeBlock의 getCodeString, MathCodeBridge의 getTextContent 등에서 공통으로 사용.
 */
export function getTextContent(node: ReactNode): string {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(getTextContent).join('')
    if (isValidElement<{ children?: ReactNode }>(node)) {
        return getTextContent(node.props.children)
    }
    return String(node ?? '')
}
