document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const addButtons = {
        'add-button': createButton,
        'add-input': createInput, 
        'add-textarea': createTextarea,
        'add-select': createSelect,
        'add-checkbox': createCheckbox,
        'add-text': createTextBlock,
        'add-image': createImagePlaceholder
    };
    
    let activeComponent = null;
    let offsetX, offsetY;
    let isResizing = false;
    let originalWidth, originalHeight, originalX, originalY;
    let componentCounter = 0;
    
    // Set up component creation buttons
    Object.keys(addButtons).forEach(id => {
        document.getElementById(id).addEventListener('click', function() {
            const component = addButtons[id]();
            positionNewComponent(component);
            canvas.appendChild(component);
            makeComponentInteractive(component);
        });
    });
    
    // Set up action buttons
    document.getElementById('clear-all').addEventListener('click', clearCanvas);
    document.getElementById('save-layout').addEventListener('click', saveLayout);
    document.getElementById('load-layout').addEventListener('click', loadLayout);
    
    // Component creation functions
    function createComponent(className, content) {
        const component = document.createElement('div');
        component.className = `component ${className || ''}`;
        component.id = `component-${++componentCounter}`;
        component.style.left = '20px';
        component.style.top = '20px';
        component.style.width = '200px';
        component.style.height = '80px';
        component.setAttribute('tabindex', '0');
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'control-btn delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            component.remove();
        });
        component.appendChild(deleteBtn);
        
        // Add resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        component.appendChild(resizeHandle);
        
        if (content) {
            component.appendChild(content);
        }
        
        return component;
    }
    
    function createButton() {
        const button = document.createElement('button');
        button.textContent = 'Button';
        button.style.margin = '10px';
        button.style.padding = '8px 16px';
        
        const component = createComponent('button-component');
        component.appendChild(button);
        
        button.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            const newText = prompt('Enter button text:', button.textContent);
            if (newText !== null) {
                button.textContent = newText;
            }
        });
        
        return component;
    }
    
    function createInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter text here...';
        
        const component = createComponent('input-component');
        component.appendChild(input);
        
        input.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        return component;
    }
    
    function createTextarea() {
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Enter text here...';
        
        const component = createComponent('textarea-component');
        component.appendChild(textarea);
        
        textarea.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        return component;
    }
    
    function createSelect() {
        const select = document.createElement('select');
        ['Option 1', 'Option 2', 'Option 3'].forEach(optionText => {
            const option = document.createElement('option');
            option.text = optionText;
            select.add(option);
        });
        
        const component = createComponent('select-component');
        component.appendChild(select);
        
        select.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        select.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            const newOptions = prompt('Enter options separated by commas:', 'Option 1, Option 2, Option 3');
            if (newOptions !== null) {
                select.innerHTML = '';
                newOptions.split(',').forEach(optionText => {
                    const option = document.createElement('option');
                    option.text = optionText.trim();
                    select.add(option);
                });
            }
        });
        
        return component;
    }
    
    function createCheckbox() {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' Checkbox Label'));
        
        const component = createComponent('checkbox-component');
        component.appendChild(label);
        
        checkbox.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        label.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            const newText = prompt('Enter label text:', label.textContent);
            if (newText !== null) {
                label.childNodes[1].nodeValue = ' ' + newText;
            }
        });
        
        return component;
    }
    
    function createTextBlock() {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-content';
        textDiv.textContent = 'Double-click to edit this text block.';
        
        const component = createComponent('text-component');
        component.appendChild(textDiv);
        
        textDiv.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            const newText = prompt('Enter text:', textDiv.textContent);
            if (newText !== null) {
                textDiv.textContent = newText;
            }
        });
        
        return component;
    }
    
    function createImagePlaceholder() {
        const imgPlaceholder = document.createElement('div');
        imgPlaceholder.className = 'image-placeholder';
        imgPlaceholder.textContent = 'Image Placeholder';
        
        const component = createComponent('image-component');
        component.appendChild(imgPlaceholder);
        
        return component;
    }
    
    function positionNewComponent(component) {
        // Find a position that doesn't overlap with existing components
        let left = 20;
        let top = 20;
        let overlap;
        
        do {
            overlap = false;
            const components = canvas.querySelectorAll('.component');
            
            components.forEach(existingComponent => {
                const rect1 = {
                    left: left,
                    top: top,
                    right: left + 200,
                    bottom: top + 80
                };
                
                const rect2 = existingComponent.getBoundingClientRect();
                rect2.left -= canvas.getBoundingClientRect().left;
                rect2.top -= canvas.getBoundingClientRect().top;
                rect2.right = rect2.left + rect2.width;
                rect2.bottom = rect2.top + rect2.height;
                
                if (!(rect1.right < rect2.left || 
                      rect1.left > rect2.right || 
                      rect1.bottom < rect2.top || 
                      rect1.top > rect2.bottom)) {
                    overlap = true;
                    left += 20;
                    top += 20;
                    
                    // Reset position if it goes too far
                    if (left > 300) {
                        left = 20;
                        top += 40;
                    }
                    if (top > 400) {
                        top = 20;
                    }
                }
            });
        } while (overlap);
        
        component.style.left = left + 'px';
        component.style.top = top + 'px';
    }
    
    function makeComponentInteractive(component) {
        component.addEventListener('mousedown', startDragOrResize);
        component.addEventListener('touchstart', handleTouchStart, { passive: false });
    }
    
    function startDragOrResize(e) {
        if (e.target.classList.contains('resize-handle')) {
            startResize(e);
        } else if (e.target.classList.contains('component') || e.target.parentElement.classList.contains('component')) {
            startDrag(e);
        }
    }
    
    function startDrag(e) {
        e.preventDefault();
        activeComponent = e.target.classList.contains('component') ? e.target : e.target.parentElement;
        
        // Bring active component to front
        const maxZ = Math.max(...Array.from(document.querySelectorAll('.component'))
            .map(el => parseInt(el.style.zIndex || 0)));
        activeComponent.style.zIndex = maxZ + 1;
        
        const rect = activeComponent.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        offsetX = e.clientX - (rect.left - canvasRect.left);
        offsetY = e.clientY - (rect.top - canvasRect.top);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    function drag(e) {
        if (!activeComponent) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        let left = e.clientX - offsetX;
        let top = e.clientY - offsetY;
        
        // Keep within canvas boundaries
        const width = parseFloat(activeComponent.style.width);
        const height = parseFloat(activeComponent.style.height);
        
        left = Math.max(0, Math.min(left, canvasRect.width - width));
        top = Math.max(0, Math.min(top, canvasRect.height - height));
        
        activeComponent.style.left = left + 'px';
        activeComponent.style.top = top + 'px';
    }
    
    function stopDrag() {
        activeComponent = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
    
    function startResize(e) {
        e.preventDefault();
        isResizing = true;
        activeComponent = e.target.parentElement;
        
        // Bring active component to front
        const maxZ = Math.max(...Array.from(document.querySelectorAll('.component'))
            .map(el => parseInt(el.style.zIndex || 0)));
        activeComponent.style.zIndex = maxZ + 1;
        
        originalWidth = parseFloat(activeComponent.style.width);
        originalHeight = parseFloat(activeComponent.style.height);
        originalX = e.clientX;
        originalY = e.clientY;
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }
    
    function resize(e) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - originalX;
        const deltaY = e.clientY - originalY;
        
        let newWidth = Math.max(100, originalWidth + deltaX);
        let newHeight = Math.max(40, originalHeight + deltaY);
        
        // Keep within canvas boundaries
        const canvasRect = canvas.getBoundingClientRect();
        const componentRect = activeComponent.getBoundingClientRect();
        const maxWidth = canvasRect.width - (componentRect.left - canvasRect.left);
        const maxHeight = canvasRect.height - (componentRect.top - canvasRect.top);
        
        newWidth = Math.min(newWidth, maxWidth);
        newHeight = Math.min(newHeight, maxHeight);
        
        activeComponent.style.width = newWidth + 'px';
        activeComponent.style.height = newHeight + 'px';
    }
    
    function stopResize() {
        isResizing = false;
        activeComponent = null;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (target.classList.contains('resize-handle')) {
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            target.dispatchEvent(mouseEvent);
        } else if (target.classList.contains('component') || target.closest('.component')) {
            const component = target.classList.contains('component') ? target : target.closest('.component');
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            component.dispatchEvent(mouseEvent);
        }
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }
    
    function handleTouchMove(e) {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        
        if (isResizing) {
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            document.dispatchEvent(mouseEvent);
        } else if (activeComponent) {
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            document.dispatchEvent(mouseEvent);
        }
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        
        if (isResizing) {
            const mouseEvent = new MouseEvent('mouseup');
            document.dispatchEvent(mouseEvent);
        } else if (activeComponent) {
            const mouseEvent = new MouseEvent('mouseup');
            document.dispatchEvent(mouseEvent);
        }
        
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    }
    
    // Canvas actions
    function clearCanvas() {
        if (confirm('Are you sure you want to clear all components?')) {
            const components = canvas.querySelectorAll('.component');
            components.forEach(component => component.remove());
            componentCounter = 0;
        }
    }
    
    function saveLayout() {
        const components = Array.from(canvas.querySelectorAll('.component'));
        const layout = components.map(component => {
            const data = {
                id: component.id,
                type: getComponentType(component),
                left: component.style.left,
                top: component.style.top,
                width: component.style.width,
                height: component.style.height,
                zIndex: component.style.zIndex || 0
            };
            
            // Save component-specific data
            if (data.type === 'button-component') {
                data.text = component.querySelector('button').textContent;
            } else if (data.type === 'text-component') {
                data.text = component.querySelector('.text-content').textContent;
            } else if (data.type === 'checkbox-component') {
                data.text = component.querySelector('label').textContent;
                data.checked = component.querySelector('input[type="checkbox"]').checked;
            } else if (data.type === 'select-component') {
                data.options = Array.from(component.querySelector('select').options).map(option => option.text);
            }
            
            return data;
        });
        
        const layoutJSON = JSON.stringify(layout);
        localStorage.setItem('componentLayout', layoutJSON);
        alert('Layout saved successfully!');
    }
    
    function loadLayout() {
        const layoutJSON = localStorage.getItem('componentLayout');
        if (!layoutJSON) {
            alert('No saved layout found!');
            return;
        }
        
        try {
            clearCanvas();
            const layout = JSON.parse(layoutJSON);
            
            layout.forEach(item => {
                let component;
                
                // Create appropriate component
                if (item.type === 'button-component') {
                    component = createButton();
                    component.querySelector('button').textContent = item.text || 'Button';
                } else if (item.type === 'input-component') {
                    component = createInput();
                } else if (item.type === 'textarea-component') {
                    component = createTextarea();
                } else if (item.type === 'select-component') {
                    component = createSelect();
                    if (item.options && item.options.length) {
                        const select = component.querySelector('select');
                        select.innerHTML = '';
                        item.options.forEach(optionText => {
                            const option = document.createElement('option');
                            option.text = optionText;
                            select.add(option);
                        });
                    }
                } else if (item.type === 'checkbox-component') {
                    component = createCheckbox();
                    if (item.text) {
                        component.querySelector('label').childNodes[1].nodeValue = item.text;
                    }
                    component.querySelector('input[type="checkbox"]').checked = item.checked || false;
                } else if (item.type === 'text-component') {
                    component = createTextBlock();
                    component.querySelector('.text-content').textContent = item.text || 'Text Block';
                } else if (item.type === 'image-component') {
                    component = createImagePlaceholder();
                }
                
                if (component) {
                    // Set position and size
                    component.style.left = item.left || '20px';
                    component.style.top = item.top || '20px';
                    component.style.width = item.width || '200px';
                    component.style.height = item.height || '80px';
                    component.style.zIndex = item.zIndex || 0;
                    component.id = item.id || `component-${++componentCounter}`;
                    
                    // Add to canvas and make interactive
                    canvas.appendChild(component);
                    makeComponentInteractive(component);
                }
            });
            
            // Update component counter
            const maxId = Math.max(...layout.map(item => {
                const idParts = item.id.split('-');
                return parseInt(idParts[idParts.length - 1]);
            }));
            componentCounter = maxId;
            
            alert('Layout loaded successfully!');
        } catch (e) {
            console.error('Error loading layout:', e);
            alert('Error loading layout!');
        }
    }
    
    function getComponentType(component) {
        if (component.classList.contains('button-component')) return 'button-component';
        if (component.classList.contains('input-component')) return 'input-component';
        if (component.classList.contains('textarea-component')) return 'textarea-component';
        if (component.classList.contains('select-component')) return 'select-component';
        if (component.classList.contains('checkbox-component')) return 'checkbox-component';
        if (component.classList.contains('text-component')) return 'text-component';
        if (component.classList.contains('image-component')) return 'image-component';
        return 'unknown';
    }
});