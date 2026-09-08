(() => {
  const canvas = document.querySelector('#life-field');
  if (!canvas) return;

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particles = [];
  const pointer = { x: 0, y: 0, active: false };
  let width = 0;
  let height = 0;
  let frame = 0;
  let animationId = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    particles.length = 0;
    const count = Math.min(62, Math.max(28, Math.round(width / 11)));
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.min(width, height) * (0.16 + Math.random() * 0.36);
      particles.push({
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        size: 0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2
      });
    }
  };

  const render = () => {
    context.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const pulse = 1 + Math.sin(frame * 0.012) * 0.035;

    const glow = context.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.47);
    glow.addColorStop(0, 'rgba(128, 255, 218, 0.13)');
    glow.addColorStop(0.34, 'rgba(92, 176, 255, 0.06)');
    glow.addColorStop(1, 'rgba(3, 7, 13, 0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      if (!reducedMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        const dx = particle.x - cx;
        const dy = particle.y - cy;
        const distance = Math.hypot(dx, dy) || 1;
        const tangent = 0.006;
        particle.x += (-dy / distance) * tangent;
        particle.y += (dx / distance) * tangent;

        if (pointer.active) {
          const px = pointer.x - particle.x;
          const py = pointer.y - particle.y;
          const pd = Math.hypot(px, py);
          if (pd < 140 && pd > 1) {
            particle.x -= (px / pd) * (140 - pd) * 0.002;
            particle.y -= (py / pd) * (140 - pd) * 0.002;
          }
        }

        const maxRadius = Math.min(width, height) * 0.49;
        if (distance > maxRadius || particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.min(width, height) * (0.18 + Math.random() * 0.26);
          particle.x = cx + Math.cos(angle) * radius;
          particle.y = cy + Math.sin(angle) * radius;
        }
      }

      for (let targetIndex = index + 1; targetIndex < particles.length; targetIndex += 1) {
        const target = particles[targetIndex];
        const dx = particle.x - target.x;
        const dy = particle.y - target.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 88) {
          context.strokeStyle = `rgba(115, 229, 255, ${0.15 * (1 - distance / 88)})`;
          context.lineWidth = 0.65;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(target.x, target.y);
          context.stroke();
        }
      }

      const coreDistance = Math.hypot(particle.x - cx, particle.y - cy);
      if (coreDistance < Math.min(width, height) * 0.31) {
        context.strokeStyle = `rgba(139, 255, 206, ${0.09 * (1 - coreDistance / (Math.min(width, height) * 0.31))})`;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(cx, cy);
        context.stroke();
      }

      context.fillStyle = index % 7 === 0 ? 'rgba(171, 255, 203, 0.95)' : 'rgba(108, 204, 255, 0.72)';
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);
      context.fill();
    });

    frame += 1;
    if (!reducedMotion && !document.hidden) animationId = requestAnimationFrame(render);
  };

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });
  canvas.addEventListener('pointerleave', () => { pointer.active = false; });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(animationId);
    if (!document.hidden && !reducedMotion) animationId = requestAnimationFrame(render);
  });
  window.addEventListener('resize', resize, { passive: true });

  resize();
  render();
})();
