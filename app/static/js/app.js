/* ============================================================
   ASTRA-XDR — Front-end interactions
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Scroll-reveal (IntersectionObserver)
  --------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll(".reveal, .reveal-up");
    if (!targets.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------
     2. Hero stat counters
  --------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll(".stat-num[data-count]");
    if (!counters.length) return;

    function animateCounter(el) {
      var target = parseFloat(el.getAttribute("data-count"), 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }
      var duration = 1400;
      var start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      window.requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) { obs.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------------------------------------------------------
     3. Navbar background on scroll
  --------------------------------------------------------- */
  function initNavbarScroll() {
    var nav = document.getElementById("mainNav");
    if (!nav) return;

    function update() {
      if (window.scrollY > 24) {
        nav.style.background = "rgba(7, 10, 16, 0.92)";
        nav.style.borderBottomColor = "rgba(148, 176, 214, 0.22)";
      } else {
        nav.style.background = "rgba(7, 10, 16, 0.72)";
        nav.style.borderBottomColor = "rgba(148, 176, 214, 0.14)";
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------------------------------------------------------
     4. Hero "threat graph" canvas — animated network of nodes
        representing cross-signal detection (the page's
        signature visual element).
  --------------------------------------------------------- */
  function initThreatGraph() {
    var canvas = document.getElementById("threatGraph");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var section = canvas.parentElement;
    var nodes = [];
    var width, height, dpr;
    var NODE_COUNT_BASE = 42;
    var LINK_DISTANCE = 150;
    var animationId = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = section.offsetWidth;
      height = section.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function buildNodes() {
      var count = Math.max(18, Math.min(NODE_COUNT_BASE, Math.floor((width * height) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.6 + 1,
          pulse: Math.random() * Math.PI * 2,
          alert: Math.random() < 0.12
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      // update positions
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      // draw links
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x;
          var dy = nodes[a].y - nodes[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            var opacity = (1 - dist / LINK_DISTANCE) * 0.16;
            ctx.strokeStyle = "rgba(34, 211, 238, " + opacity + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
      }

      // draw nodes
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        var glow = (Math.sin(node.pulse) + 1) / 2;
        var color = node.alert ? "0, 230, 118" : "34, 211, 238";
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + color + ", " + (0.5 + glow * 0.4) + ")";
        ctx.arc(node.x, node.y, node.r + glow * 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (node.alert && glow > 0.85) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(0, 230, 118, " + (glow - 0.6) + ")";
          ctx.lineWidth = 1;
          ctx.arc(node.x, node.y, node.r + 6 + glow * 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationId = window.requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);

    if (!prefersReducedMotion) {
      step();
    } else {
      // static single frame for reduced-motion users
      step();
      window.cancelAnimationFrame(animationId);
    }
  }

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initScrollReveal();
    initCounters();
    initNavbarScroll();
    initThreatGraph();
  });
})();
