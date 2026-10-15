export const TRACKATON_WEBSITE_ID = 'jd79w2wpqpayas6bw1j9nhb20h7yqj82'
export const TRACKATON_ENDPOINT = 'https://resolute-orca-949.convex.site/api/e'

/**
 * Inline bootstrap emitted once in the SSR document.
 * Sends a Trackaton pageview immediately and on every history change.
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
    function pageview() {
      try {
        var path = window.location.pathname || "/";
        if (path === lastPath) return;
        lastPath = path;
        send("pageview", path);
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
        send("custom", node.getAttribute("trackaton-on-click") || "", {
          tagName: node.tagName,
          text: (node.innerText || "").substring(0, 100).trim()
        });
      } catch (e) {}
    }, true);
  })()`
}
