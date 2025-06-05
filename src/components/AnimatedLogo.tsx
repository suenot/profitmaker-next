import React, { useState, useEffect } from 'react';

interface AnimatedLogoProps {
  width?: number;
  height?: number;
  className?: string;
  showBackground?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  width = 200,
  height = 200,
  className = '',
  showBackground = false,
}) => {
  const [animationState, setAnimationState] = useState<'initial' | 'docking' | 'rotating' | 'finishing'>('initial');

  // Обработка наведения мыши
  const handleMouseEnter = () => {
    if (animationState === 'initial' || animationState === 'finishing') {
      setAnimationState('docking');
      
      // После стыковки через 600мс запускаем вращение
      setTimeout(() => {
        setAnimationState('rotating');
      }, 600);
    }
  };

  // Обработка ухода мыши
  const handleMouseLeave = () => {
    if (animationState === 'rotating' || animationState === 'docking') {
      setAnimationState('finishing');
      
      // Через 600мс вернуться в исходное состояние
      setTimeout(() => {
        setAnimationState('initial');
      }, 600);
    }
  };

  // Определяем стили для розового треугольника
  const getPinkTriangleStyles = () => {
    let transform = '';
    let transition = '';
    
    switch (animationState) {
      case 'initial':
        transform = 'translate(0, 0)';
        break;
      case 'docking':
        transform = 'translate(20px, 0)';
        transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        break;
      case 'rotating':
        transform = 'translate(20px, 0)';
        break;
      case 'finishing':
        transform = 'translate(0, 0)';
        transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        break;
    }
    
    return { transform, transition };
  };

  // Определяем стили для зеленого треугольника
  const getGreenTriangleStyles = () => {
    let transform = '';
    let transition = '';
    
    switch (animationState) {
      case 'initial':
        transform = 'translate(0, 0)';
        break;
      case 'docking':
        transform = 'translate(-20px, 0)';
        transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        break;
      case 'rotating':
        transform = 'translate(-20px, 0)';
        break;
      case 'finishing':
        transform = 'translate(0, 0)';
        transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        break;
    }
    
    return { transform, transition };
  };

  // Определяем стили для группы (вращение)
  const getGroupStyles = () => {
    let animation = '';
    let transform = 'rotate(0deg)';
    let transition = '';
    
    switch (animationState) {
      case 'rotating':
        animation = 'spin 4s linear infinite';
        break;
      case 'finishing':
        // При завершении используем плавный переход к нулевому градусу
        transform = 'rotate(0deg)';
        transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        break;
    }
    
    return { animation, transform, transition };
  };

  // Получаем стили для каждого элемента
  const pinkStyles = getPinkTriangleStyles();
  const greenStyles = getGreenTriangleStyles();
  const groupStyles = getGroupStyles();

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}
      </style>
      
      {/* Белый фоновый круг, отображается только во время анимации */}
      {animationState !== 'initial' && <circle cx="100" cy="100" r="100" fill="white" />}
      
      {/* Контейнер для анимации */}
      <g 
        id="compass" 
        style={{ 
          transformOrigin: 'center',
          transform: groupStyles.transform,
          transition: groupStyles.transition,
          animation: groupStyles.animation
        }}
      >
        {/* Розовый треугольник (вниз) */}
        <polygon 
          id="pink-triangle" 
          points="65,125 95,75 35,75" 
          fill="#ff9aab" 
          style={{
            transformOrigin: '65px 105px',
            transform: pinkStyles.transform,
            transition: pinkStyles.transition
          }}
        />
        
        {/* Зеленый треугольник (вверх) */}
        <polygon 
          id="green-triangle" 
          points="135,75 105,125 165,125" 
          fill="#98ffa0" 
          style={{
            transformOrigin: '135px 105px',
            transform: greenStyles.transform,
            transition: greenStyles.transition
          }}
        />
      </g>
    </svg>
  );
}; 