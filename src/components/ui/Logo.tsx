export function Logo({ size = "normal" }: { size?: "small" | "normal" | "large" }) {
  const sizes = {
    small: "text-lg",
    normal: "text-xl",
    large: "text-2xl",
  };
  return (
    <div className={`font-bold ${sizes[size]} logo-text flex items-center gap-2`}>
      <i className={`material-icons ${size === "small" ? "text-lg" : size === "large" ? "text-3xl" : "text-xl"}`} style={{ color: "#6366f1" }}>inventory_2</i>
      Inventarte
    </div>
  );
}