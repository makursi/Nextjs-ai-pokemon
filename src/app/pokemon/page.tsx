import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { PokemonList } from "@/components/pokemon-list";

export const metadata: Metadata = {
  title: "宝可梦图鉴",
  description: "查询宝可梦详细信息与图鉴数据",
};

export default function PokemonPage() {
  return (
    <div className="p-8">
      <Button asChild variant="ghost" size="sm">
        <Link href="/dashboard">
          <ArrowLeftIcon data-icon="inline-start" />
          返回
        </Link>
      </Button>
      <div className="max-w-xl mx-auto mt-4">
        <PokemonList />
      </div>
    </div>
  );
}
