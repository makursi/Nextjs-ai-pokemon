import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon } from "lucide-react";

type PokemonData = {
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };
};

async function getPokemon(name: string): Promise<PokemonData> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`,
  );
  if (!res.ok) notFound();
  return res.json();
}

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
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-5 w-20 rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}

async function PokemonDetail({ name }: { name: string }) {
  const pokemon = await getPokemon(name);
  const imageUrl = pokemon.sprites.other["official-artwork"].front_default;

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
        <CardHeader className="items-center pb-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={pokemon.name}
              className="size-64 object-contain"
            />
          ) : (
            <div className="size-64 flex items-center justify-center bg-muted rounded-xl text-muted-foreground">
              No image
            </div>
          )}
          <CardTitle className="capitalize text-2xl">{pokemon.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Badge variant="secondary" className="capitalize text-sm">
            #{pokemon.name}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `${name.charAt(0).toUpperCase() + name.slice(1)} - Pokemon`,
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
