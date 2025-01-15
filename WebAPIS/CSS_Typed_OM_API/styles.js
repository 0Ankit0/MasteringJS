export const buttonStyles = {
    primary: {
        padding: CSSStyleValue.parse('padding', '15px'),
        backgroundColor: CSSStyleValue.parse('background-color', 'blue'),
        color: CSSStyleValue.parse('color', 'white'),
        border: CSSStyleValue.parse('border', 'none'),
        borderRadius: CSSStyleValue.parse('border-radius', '8px'),
    },
    danger: {
        padding: CSSStyleValue.parse('padding', '15px'),
        backgroundColor: CSSStyleValue.parse('background-color', 'red'),
        color: CSSStyleValue.parse('color', 'white'),
        border: CSSStyleValue.parse('border', 'none'),
        borderRadius: CSSStyleValue.parse('border-radius', '8px'),
    },
    success: {
        padding: CSSStyleValue.parse('padding', '15px'),
        backgroundColor: CSSStyleValue.parse('background-color', 'green'),
        color: CSSStyleValue.parse('color', 'white'),
        border: CSSStyleValue.parse('border', 'none'),
        borderRadius: CSSStyleValue.parse('border-radius', '8px'),
    },
};

function camelToKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function applyStyle(element, styleObject) {
    for (const [property, value] of Object.entries(styleObject)) {
        const kebabProperty = camelToKebabCase(property);
        element.attributeStyleMap.set(kebabProperty, value);
    }
}