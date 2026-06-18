import { useState, useRef, type MouseEvent } from 'react';

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Posicionamento X (Horizontal)
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Posicionamento Y (Vertical)
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const onMouseDown = (e: MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    
    // Captura as posições iniciais do mouse e do scroll
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
    
    setStartY(e.pageY - ref.current.offsetTop);
    setScrollTop(ref.current.scrollTop);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    
    // Calcula a distância arrastada no eixo X
    const x = e.pageX - ref.current.offsetLeft;
    const walkX = (x - startX) * 2; // Multiplicador de velocidade horizontal
    ref.current.scrollLeft = scrollLeft - walkX;

    // Calcula a distância arrastada no eixo Y
    const y = e.pageY - ref.current.offsetTop;
    const walkY = (y - startY) * 2; // Multiplicador de velocidade vertical
    ref.current.scrollTop = scrollTop - walkY;
  };

  return {
    ref,
    isDragging,
    events: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
    }
  };
}
