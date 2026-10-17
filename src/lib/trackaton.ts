export const TRACKATON_WEBSITE_ID = 'jd79w2wpqpayas6bw1j9nhb20h7yqj82'
export const TRACKATON_ENDPOINT = 'https://resolute-orca-949.convex.site/api/e'

export const FUNNEL_EVENTS = [
  'signup_started',
  'signup_completed',
  'demo_opened',
  'live_kiosk_click',
  'checkout_started',
  'plan_selected',
] as const

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number]

export const TRACKATON_PLANS = ['gratis', 'event', 'season'] as const

export type TrackatonPlan = (typeof TRACKATON_PLANS)[number]

type TrackatonGlobals = {
  qrbutikTrack?: (name: string, extra?: { plan?: string }) => void
}

/**
 * Inline bootstrap emitted once in the SSR document.
 * Sends a Trackaton pageview immediately and on every history change,
 * plus funnel customs (demo open, clicks, and window.qrbutikTrack).
 * It does not import the app, Convex, or the kiosk route, so a client
 * exception on /s/* cannot prevent the first pageview or later route views.
 * Replaces track.js so pageviews are not counted twice.
 */
export function trackatonBootstrapSource(): string {
  return `(function(){
    if (window.__qrbutikTrackaton) return;
    window.__qrbutikTrackaton = 1;
    var websiteId = ${JSON.stringify(TRACKATON_WEBSITE_ID)};
    var endpoint = ${JSON.stringify(TRACKATON_ENDPOINT)};
    var lastPath = "";
    function device() {
      var width = window.innerWidth || 0;
      var deviceType = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
      var screenCategory = width >= 1024 ? ">=1024" : width >= 768 ? "768-1023" : "<768";
      return { device_type: deviceType, screen_category: screenCategory };
    }
    function allowedPlan(value) {
      if (value === "gratis" || value === "event" || value === "season") return value;
      return "";
    }
    function send(type, name, extra) {
      try {
        var payload = {
          websiteId: websiteId,
          type: type,
          name: name,
          metadata: Object.assign(device(), extra || {}, {
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer || ""
          })
        };
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(function(){});
      } catch (e) {}
    }
    function trackCustom(name, extra) {
      try {
        if (!name) return;
        send("custom", String(name).substring(0, 64), extra || {});
      } catch (e) {}
    }
    window.qrbutikTrack = function(name, extra) {
      try {
        var safe = {};
        var plan = allowedPlan(extra && extra.plan);
        if (plan) safe.plan = plan;
        trackCustom(name, safe);
      } catch (e) {}
    };
    function pageview() {
      try {
        var path = window.location.pathname || "/";
        if (path === lastPath) return;
        lastPath = path;
        send("pageview", path);
        if (path === "/s/demo") trackCustom("demo_opened");
      } catch (e) {}
    }
    pageview();
    var pushState = history.pushState;
    var replaceState = history.replaceState;
    history.pushState = function() {
      var result = pushState.apply(this, arguments);
      pageview();
      return result;
    };
    history.replaceState = function() {
      var result = replaceState.apply(this, arguments);
      pageview();
      return result;
    };
    window.addEventListener("popstate", pageview);
    document.addEventListener("click", function(event) {
      try {
        var node = event.target && event.target.closest && event.target.closest("[trackaton-on-click]");
        if (!node) return;
        var name = node.getAttribute("trackaton-on-click") || "";
        var extra = {
          tagName: node.tagName,
          text: (node.innerText || "").substring(0, 100).trim()
        };
        var plan = allowedPlan(node.getAttribute("data-trackaton-plan"));
        if (plan) extra.plan = plan;
        trackCustom(name, extra);
        var also = node.getAttribute("data-trackaton-also") || "";
        if (
          also &&
          also !== name &&
          (also === "signup_started" || also === "signup_completed" || also === "demo_opened" || also === "live_kiosk_click" || also === "checkout_started" || also === "plan_selected")
        ) {
          trackCustom(also, plan ? { plan: plan } : {});
        }
      } catch (e) {}
    }, true);
  })()`
}

export function isTrackatonPlan(value: string): value is TrackatonPlan {
  return (TRACKATON_PLANS as ReadonlyArray<string>).includes(value)
}

/**
 * Failure-safe funnel event. Drops anything except an allowlisted plan name.
 * A missing snippet or a thrown tracker does not affect the page.
 */
export function trackFunnelEvent(
  name: FunnelEventName,
  metadata?: { plan?: string },
): void {
  try {
    if (typeof window === 'undefined') return
    const track = (window as TrackatonGlobals).qrbutikTrack
    if (typeof track !== 'function') return
    const plan = metadata?.plan
    track(name, plan && isTrackatonPlan(plan) ? { plan } : {})
  } catch {
    // Tracking must never break the page.
  }
}
