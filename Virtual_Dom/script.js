
// Function to create a Virtual DOM representation of a DOM node
function createVirtualDOM(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent; // Return text content for text nodes
    }

    const vNode = {
        tag: node.tagName, // Store the tag name of the element
        props: {}, // Store the element attributes (e.g., id, class)
        children: [], // Store the children of the element
    };

    // Add attributes from the real DOM to the virtual DOM node
    for (const attr of node.attributes || []) {
        vNode.props[attr.name] = attr.value;
    }

    // Add child nodes to the virtual DOM recursively
    for (const child of node.childNodes) {
        vNode.children.push(createVirtualDOM(child));
    }

    return vNode;
}

// Function to render a Virtual DOM into real DOM
function render(vNode) {
    if (typeof vNode === "string") {
        return document.createTextNode(vNode); // Render text nodes as text nodes
    }

    // Create an element from the virtual DOM tag
    const element = document.createElement(vNode.tag);

    // Set attributes for the element
    for (const [key, value] of Object.entries(vNode.props)) {
        element.setAttribute(key, value);
    }

    // Render children and append them to the element
    for (const child of vNode.children) {
        element.appendChild(render(child));
    }

    return element;
}

// Function to diff and patch real DOM using Virtual DOM
function diffAndPatch(parent, oldVNode, newVNode, index = 0) {
    // Normalize real DOM children to filter out any whitespace text nodes
    const realChildren = Array.from(parent.childNodes).filter(
        (node) =>
            node.nodeType !== Node.TEXT_NODE || node.textContent.trim() !== ""
    );
    const realNode = realChildren[index]; // Find the corresponding real node by index

    // Case 1: Add new node if no oldVNode exists
    if (!oldVNode && newVNode) {
        const newNode = render(newVNode);
        if (
            newNode &&
            (newNode.nodeType === Node.ELEMENT_NODE ||
                newNode.nodeType === Node.TEXT_NODE)
        ) {
            parent.appendChild(newNode); // Append the new node if valid
        } else {
            console.warn("Attempted to append an invalid node:", newVNode);
        }
        return;
    }

    // Case 2: Remove the old node if newVNode does not exist
    if (oldVNode && !newVNode) {
        if (realNode) parent.removeChild(realNode); // Remove the real node
        return;
    }

    // Case 3: Replace old node with new node
    if (
        typeof oldVNode !== typeof newVNode ||
        (oldVNode && oldVNode.tag !== newVNode.tag)
    ) {
        if (realNode) {
            const newNode = render(newVNode); // Render new node
            if (
                newNode &&
                (newNode.nodeType === Node.ELEMENT_NODE ||
                    newNode.nodeType === Node.TEXT_NODE)
            ) {
                parent.replaceChild(newNode, realNode); // Replace the old node with the new node
            } else {
                console.warn(
                    "Attempted to replace with an invalid node:",
                    newVNode
                );
            }
        } else {
            const newNode = render(newVNode);
            if (newNode) parent.appendChild(newNode); // Append new node if real node does not exist
        }
        return;
    }

    // Case 4: Update text content if only text is different
    if (typeof newVNode === "string" && oldVNode !== newVNode) {
        if (realNode && realNode.nodeType === Node.TEXT_NODE) {
            realNode.textContent = newVNode; // Update the text content
        }
        return;
    }

    // Case 5: Update attributes and recursively diff the children
    if (newVNode.tag) {
        // Update the attributes of the real node
        for (const [key, value] of Object.entries(newVNode.props || {})) {
            if (!oldVNode.props || oldVNode.props[key] !== value) {
                realNode.setAttribute(key, value);
            }
        }

        // Remove attributes that no longer exist in the newVNode
        for (const key in oldVNode.props || {}) {
            if (!(key in newVNode.props)) {
                realNode.removeAttribute(key);
            }
        }

        // Ensure the real node exists before diffing its children
        if (!realNode || realNode.nodeType !== Node.ELEMENT_NODE) {
            console.warn(
                "Real node not found or invalid for child diffing:",
                oldVNode,
                newVNode
            );
            const newNode = render(newVNode);
            if (newNode) parent.appendChild(newNode);
            return;
        }

        // Recursively diff and patch the children of the nodes
        const oldChildren = oldVNode.children.filter(
            (child) => typeof child !== "string" || child.trim() !== ""
        );
        const newChildren = newVNode.children.filter(
            (child) => typeof child !== "string" || child.trim() !== ""
        );

        // Diff children with respect to their index positions
        const maxLength = Math.max(oldChildren.length, newChildren.length);
        for (let i = 0; i < maxLength; i++) {
            diffAndPatch(realNode, oldChildren[i], newChildren[i], i);
        }
    }
}

// Initial Virtual DOM backup (representing the current real DOM state)
let currentVirtualDOM = createVirtualDOM(document.getElementById("app"));

// Simulated HTML response (for updating the content)
const newHTMLResponse = `
      <div id="app">
          <h1>Hello, Updated Virtual DOM!</h1>
          <p>This content was updated from the server.</p>
          <p>New paragraph added!</p>
      </div>
  `;

// Event listener to trigger updating the content
document
    .getElementById("update-content")
    .addEventListener("click", () => {
        // Parse the new HTML response and convert it into Virtual DOM
        const parser = new DOMParser();
        const newDocument = parser.parseFromString(
            newHTMLResponse,
            "text/html"
        );
        const newVirtualDOM = createVirtualDOM(
            newDocument.getElementById("app")
        );

        // Call diffAndPatch function to update the real DOM based on the new virtual DOM
        const appElement = document.getElementById("app");
        diffAndPatch(appElement.parentNode, currentVirtualDOM, newVirtualDOM);

        // Update the backup Virtual DOM to reflect the new state
        currentVirtualDOM = newVirtualDOM;
    });