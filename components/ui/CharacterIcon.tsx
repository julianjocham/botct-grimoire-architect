import { getCharacterIconUrl } from "@/lib/utils/icons";

interface CharacterIconProps {
  characterId: string;
  edition: string;
  team: string;
  alt: string;
  className?: string;
  variant?: "inline" | "token";
}

export function CharacterIcon({
  characterId,
  edition,
  team,
  alt,
  className = "",
  variant = "inline"
}: CharacterIconProps) {
  const iconUrl = getCharacterIconUrl(characterId, edition, team);

  if (variant === "token") {
    return (
      <div
        className={`flex items-center justify-center rounded-full border border-[#1a1a2a] bg-[#0f0f14] ${className}`}
      >
        <img
          src={iconUrl}
          alt={alt}
          className="size-full rounded-full object-cover"
          onError={(e) => {
            const container = (e.target as HTMLImageElement).parentElement;
            if (container) container.style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
