"use client";

import Lottie from "react-lottie";

interface AnimationLottieProps {
  animationPath: object;
  width?: string | number;
}

const AnimationLottie: React.FC<AnimationLottieProps> = ({ animationPath, width }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationPath,
    style: {
      width: width || '95%',
    },
  };

  return <Lottie options={defaultOptions} />;
};

export default AnimationLottie;
