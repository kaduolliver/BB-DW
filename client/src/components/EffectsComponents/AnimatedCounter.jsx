import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function AnimatedCounter({ target = 97000000, duration = 2000, suffix = "" }) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const increment = target / (duration / 12);

            const animate = () => {
                start += increment;
                if (start < target) {
                    setCount(Math.floor(start));
                    requestAnimationFrame(animate);
                } else {
                    setCount(target);
                }
            };
            animate();
        }
    }, [inView, target, duration]);

    return (
        <span ref={ref} className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-700 text-transparent bg-clip-text">
            {count.toLocaleString()}<span className="text-5xl">{suffix}</span>
        </span>
    );
}

