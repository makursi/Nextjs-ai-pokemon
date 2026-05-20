import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon } from "lucide-react";

// ── types ──────────────────────────────────────────────

type PokemonData = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
  abilities: Array<{
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }>;
  stats: Array<{
    base_stat: number;
    stat: { name: string; url: string };
  }>;
};

type PokemonSpeciesData = {
  names: Array<{ language: { name: string }; name: string }>;
  genera: Array<{ language: { name: string }; genus: string }>;
};

// ── Chinese mappings ───────────────────────────────────

const TYPE_CN: Record<string, string> = {
  normal: "一般",
  fighting: "格斗",
  flying: "飞行",
  poison: "毒",
  ground: "地面",
  rock: "岩石",
  bug: "虫",
  ghost: "幽灵",
  steel: "钢",
  fire: "火",
  water: "水",
  grass: "草",
  electric: "电",
  psychic: "超能力",
  ice: "冰",
  dragon: "龙",
  dark: "恶",
  fairy: "妖精",
};

const ABILITY_CN: Record<string, string> = {
  "static": "静电",
  "lightning-rod": "避雷针",
  "blaze": "猛火",
  "solar-power": "太阳之力",
  "torrent": "激流",
  "rain-dish": "雨盘",
  "overgrow": "茂盛",
  "chlorophyll": "叶绿素",
  "swarm": "虫之预感",
  "guts": "毅力",
  "intimidate": "威吓",
  "levitate": "飘浮",
  "cursed-body": "诅咒之躯",
  "shadow-tag": "踩影",
  "steadfast": "不屈之心",
  "inner-focus": "精神力",
  "rough-skin": "粗糙皮肤",
  "sand-veil": "沙隐",
  "water-absorb": "储水",
  "volt-absorb": "蓄电",
  "flash-fire": "引火",
  "flame-body": "火焰之躯",
  "dry-skin": "干燥皮肤",
  "shed-skin": "蜕皮",
  "natural-cure": "自然回复",
  "serene-grace": "天恩",
  "hustle": "活力",
  "pressure": "压迫感",
  "synchronize": "同步",
  "trace": "复制",
  "download": "下载",
  "adaptability": "适应力",
  "technician": "技术高手",
  "iron-fist": "铁拳",
  "reckless": "舍身",
  "sheer-force": "强行",
  "moxie": "自信过度",
  "prankster": "恶作剧之心",
  "magic-bounce": "魔法镜",
  "regenerator": "再生力",
  "multiscale": "多重鳞片",
  "tinted-lens": "有色眼镜",
  "no-guard": "无防守",
  "huge-power": "大力士",
  "speed-boost": "加速",
  "compound-eyes": "复眼",
};

const STAT_CN: Record<string, string> = {
  hp: "HP",
  attack: "攻击",
  defense: "防御",
  "special-attack": "特攻",
  "special-defense": "特防",
  speed: "速度",
};

// ── fetchers ───────────────────────────────────────────

async function getPokemon(name: string): Promise<PokemonData> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`,
  );
  if (!res.ok) notFound();
  return res.json();
}

async function getPokemonSpecies(id: number): Promise<PokemonSpeciesData> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  if (!res.ok) return { names: [], genera: [] };
  return res.json();
}

// ── helpers ────────────────────────────────────────────

function chineseName(species: PokemonSpeciesData): string | null {
  const entry = species.names.find(
    (n) => n.language.name === "zh-hans",
  );
  return entry?.name ?? null;
}

function chineseGenus(species: PokemonSpeciesData): string | null {
  const entry = species.genera.find(
    (g) => g.language.name === "zh-hans",
  );
  return entry?.genus ?? null;
}

// ── skeleton ───────────────────────────────────────────

function PokemonDetailSkeleton() {
  return (
    <div className="flex flex-col items-center p-8">
      <div className="w-full max-w-md">
        <Skeleton className="h-9 w-16" />
      </div>
      <Card className="w-full max-w-md mt-4">
        <CardHeader className="items-center pb-6">
          <Skeleton className="size-64 rounded-xl" />
          <Skeleton className="h-8 w-32 mt-4" />
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// ── main component ─────────────────────────────────────

async function PokemonDetail({ name }: { name: string }) {
  const pokemon = await getPokemon(name);
  const species = await getPokemonSpecies(pokemon.id);

  const imageUrl = pokemon.sprites.other["official-artwork"].front_default;
  const cnName = chineseName(species);
  const cnGenus = chineseGenus(species);
  const heightM = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);

  return (
    <div className="flex flex-col items-center p-8">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeftIcon data-icon="inline-start" />
            返回
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md mt-4">
        <CardHeader className="items-center pb-4">
          {/* image */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={cnName ?? pokemon.name}
              width={256}
              height={256}
              className="object-contain"
              priority
            />
          ) : (
            <div className="size-64 flex items-center justify-center bg-muted rounded-xl text-muted-foreground">
              No image
            </div>
          )}

          {/* name */}
          <CardTitle className="text-2xl mt-4">
            {cnName ?? pokemon.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground capitalize">
            {pokemon.name}
          </p>
          {cnGenus && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {cnGenus}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* basic info */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-2">基本资料</h3>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>
                身高: <span className="text-foreground">{heightM} m</span>
              </span>
              <span>
                体重: <span className="text-foreground">{weightKg} kg</span>
              </span>
            </div>
          </div>

          {/* types */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-2">属性</h3>
            <div className="flex gap-2">
              {pokemon.types.map((t) => (
                <Badge key={t.slot} variant="default">
                  {TYPE_CN[t.type.name] ?? t.type.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* abilities */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-2">能力</h3>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((a) => (
                <Badge
                  key={a.slot}
                  variant={a.is_hidden ? "outline" : "secondary"}
                >
                  {ABILITY_CN[a.ability.name] ?? a.ability.name}
                  {a.is_hidden && (
                    <span className="text-xs ml-1">(隐藏)</span>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* stats */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-2">种族值</h3>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1">
              {pokemon.stats.map((s) => (
                <div
                  key={s.stat.name}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {STAT_CN[s.stat.name] ?? s.stat.name}
                  </span>
                  <span className="font-medium">{s.base_stat}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── page exports ───────────────────────────────────────

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    title: `${displayName} - 宝可梦`,
    description: `查看 ${displayName} 的详细图鉴信息，包括属性、技能、进化链等`,
    openGraph: {
      title: `${displayName} - 宝可梦图鉴`,
      description: `查看 ${displayName} 的详细图鉴信息`,
    },
  };
}

export default async function PokemonPage({ params }: Props) {
  const { name } = await params;

  return (
    <Suspense fallback={<PokemonDetailSkeleton />}>
      <PokemonDetail name={name} />
    </Suspense>
  );
}
