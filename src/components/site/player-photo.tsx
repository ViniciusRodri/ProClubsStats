import Image from "next/image";
import { User } from "lucide-react";

export function PlayerPhoto({
  name,
  photoUrl,
  size = 96,
  className = "",
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className={`object-cover bg-navy-800 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-navy-800 text-steel-dim ${className}`}
      style={{ width: size, height: size }}
    >
      <User size={size * 0.45} strokeWidth={1.5} />
    </div>
  );
}