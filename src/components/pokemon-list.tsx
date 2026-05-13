"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon } from "lucide-react";

async function fetchPokemonList(signal: AbortSignal) {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151", {
    signal,
  });
  if (!res.ok) throw new Error("Failed to fetch pokemon list");
  const data = await res.json();
  return data.results as { name: string }[];
}

export function PokemonList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data: allPokemon,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pokemon-list"],
    queryFn: ({ signal }) => fetchPokemonList(signal),
    staleTime: 10 * 60 * 1000,
  });

  const filteredPokemon = allPokemon
    ? allPokemon.filter((p) => {
        if (!debouncedSearch.trim()) return true;
        return p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      })
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>宝可梦查询</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索宝可梦..."
            className="pl-8"
          />
        </div>
        {isLoading && (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        )}
        {isError && (
          <p className="text-sm text-destructive">加载失败，请稍后重试</p>
        )}
        {!isLoading && !isError && (
          <>
            <div className="flex flex-wrap gap-2">
              {filteredPokemon.map((p) => (
                <Badge
                  key={p.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary px-3 py-1.5"
                  onClick={() => router.push(`/pokemon/${p.name}`)}
                >
                  {p.name}
                </Badge>
              ))}
            </div>
            {filteredPokemon.length === 0 && (
              <p className="text-sm text-muted-foreground">
                未找到匹配的宝可梦
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
