import { Fragment, type CSSProperties, type ReactNode } from "react";

/**
 * Seamless tagline stream (Variant B trust bar + outcome stream). The track is
 * rendered twice — the visible copy and an aria-hidden clone — inside a
 * `width:max-content` flex row that translates -50% via the esMarquee keyframe,
 * so the loop is gapless. `reverse` runs it right-to-left.
 */
export default function Marquee({
  items,
  itemStyle,
  separator,
  gap,
  reverse = false,
  seconds,
}: {
  items: ReactNode[];
  itemStyle: CSSProperties;
  separator: ReactNode;
  gap: string;
  reverse?: boolean;
  seconds?: number;
}) {
  const trackStyle: CSSProperties = { display: "flex", alignItems: "center", gap, paddingRight: gap };
  const track = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden || undefined} style={trackStyle}>
      {items.map((it, i) => (
        <Fragment key={i}>
          <span style={itemStyle}>{it}</span>
          {separator}
        </Fragment>
      ))}
    </div>
  );

  const marqueeStyle: CSSProperties = { animationDirection: reverse ? "reverse" : undefined };
  if (seconds) (marqueeStyle as Record<string, string>)["--mq"] = `${seconds}s`;

  return (
    <div className="es-marquee-mask es-reveal">
      <div className="es-marquee" style={marqueeStyle}>
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
