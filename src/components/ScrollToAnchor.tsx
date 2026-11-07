import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Allowed hash targets per user specifications:
 * 1. About page & sections: /about#team, /#about, #about, #story, #values
 * 2. Contact page & sections: /contact#form, /#contact, #contact, #map-section
 * 3. Products section: /products#products, /#products, #products, #catalog
 */
const ALLOWED_HASH_IDS = new Set([
  'about',
  'team',
  'story',
  'values',
  'mission',
  'contact',
  'form',
  'contact-form',
  'map-section',
  'products',
  'catalog',
  'featured-products',
]);

export function ScrollToAnchor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname, hash } = location;

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // Clean hash string (handles '#about' or '#/about' or '#projects')
    const rawTarget = hash.replace(/^#\/?/, '').trim().toLowerCase();

    // Handle legacy or non-allowed hash redirects to clean URLs
    if (rawTarget === 'projects') {
      window.history.replaceState(null, '', '/projects');
      navigate('/projects', { replace: true });
      return;
    }
    if (rawTarget === 'experience') {
      window.history.replaceState(null, '', '/experience');
      navigate('/experience', { replace: true });
      return;
    }
    if (rawTarget === 'stack') {
      window.history.replaceState(null, '', '/stack');
      navigate('/stack', { replace: true });
      return;
    }
    if (rawTarget === 'terminal') {
      window.history.replaceState(null, '', '/terminal');
      navigate('/terminal', { replace: true });
      return;
    }

    // Check if hash is one of the 3 allowed exceptions
    const isAllowed = ALLOWED_HASH_IDS.has(rawTarget);

    if (isAllowed) {
      // If user typed /#about but is on '/', redirect or scroll
      if (rawTarget === 'about' && pathname === '/' && !document.getElementById('about')) {
        navigate('/about');
        return;
      }
      if (rawTarget === 'contact' && pathname === '/' && !document.getElementById('contact')) {
        navigate('/contact');
        return;
      }

      // Scroll to anchor smoothly
      const timer = setTimeout(() => {
        const element = document.getElementById(rawTarget);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }

    // If it's an unrecognized or rogue hashcode, strip it cleanly from the URL
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
  }, [pathname, hash, navigate]);

  return null;
}

