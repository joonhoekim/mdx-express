import mermaid from 'mermaid';

export const FONT_FAMILY = "'Pretendard Variable', Pretendard, ui-sans-serif, system-ui, -apple-system, sans-serif";

// 다크/라이트 테마별 변수
export const darkThemeVars = {
    fontSize: '13px',
    fontFamily: FONT_FAMILY,
    primaryColor: '#1e293b',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#334155',
    lineColor: '#475569',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e293b',
    nodeBorder: '#334155',
    mainBkg: '#1e293b',
    nodeTextColor: '#e2e8f0',
    edgeLabelBackground: '#0f172a',
    clusterBkg: '#0f172a',
    clusterBorder: '#334155',
    labelBackground: '#0f172a',
    titleColor: '#e2e8f0',
};

export const lightThemeVars = {
    fontSize: '13px',
    fontFamily: FONT_FAMILY,
    primaryColor: '#f1f5f9',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#cbd5e1',
    lineColor: '#94a3b8',
    secondaryColor: '#f8fafc',
    tertiaryColor: '#f1f5f9',
    nodeBorder: '#cbd5e1',
    mainBkg: '#f8fafc',
    nodeTextColor: '#1e293b',
    edgeLabelBackground: '#ffffff',
    clusterBkg: '#f8fafc',
    clusterBorder: '#e2e8f0',
    labelBackground: '#ffffff',
    titleColor: '#1e293b',
};

// 테마 변경 시 재초기화 허용
let lastThemeMode: 'dark' | 'light' | null = null;

export function ensureMermaidInit(dark: boolean) {
    const mode = dark ? 'dark' : 'light';
    if (lastThemeMode === mode) return;
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: FONT_FAMILY,
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 16,
        },
        themeVariables: dark ? darkThemeVars : lightThemeVars,
    });
    lastThemeMode = mode;
}

// \n → <br/> 변환 (htmlLabels:true 에서 줄바꿈 처리)
export function preprocessMermaidContent(content: string): string {
    return content.replace(/\\n/g, '<br/>');
}
