import React, { useState } from 'react';

const DraggableComponent = ({ id, text, onDragStart, onDragOver, onDrop }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={(e) => onDrop(e, id)}
      className="bg-gray-200 p-4 m-2"
    >
      {text}
    </div>
  );
};

const App = () => {
  const [components, setComponents] = useState([
    { id: 1, text: 'Component 1' },
    { id: 2, text: 'Component 2' },
    { id: 3, text: 'Component 3' },
  ]);
  const [draggingComponent, setDraggingComponent] = useState(null);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingComponent(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, id) => {
    e.preventDefault();
    const droppedComponentId = e.dataTransfer.getData('text/plain');
    if (droppedComponentId !== id) {
      const newComponents = [...components];
      const droppedIndex = newComponents.findIndex((c) => c.id === +droppedComponentId);
      const targetIndex = newComponents.findIndex((c) => c.id === id);

      // Swap the positions of the two components
      [newComponents[droppedIndex], newComponents[targetIndex]] = [
        newComponents[targetIndex],
        newComponents[droppedIndex],
      ];

      setComponents(newComponents);
    }
    setDraggingComponent(null);
  };

  return (
    <div className="flex">
      {components.map((component) => (
        <DraggableComponent
          key={component.id}
          id={component.id}
          text={component.text}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

export default App;