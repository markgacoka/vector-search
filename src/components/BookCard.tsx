"use client";

import * as React from "react";
import { BookItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookCardProps {
  book: BookItem & { score?: number };
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Card>
      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">{book.title}</CardTitle>
          {book.score !== undefined && (
            <Badge variant="secondary" className="shrink-0 ml-auto">
              {(book.score * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">by {book.author}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{book.description}</p>
        <div className="flex flex-col gap-2">
          {book.theme && (
            <div className="text-sm">
              <span className="font-semibold">Theme:</span> {book.theme}
            </div>
          )}
          {book.format && (
            <div className="text-sm">
              <span className="font-semibold">Format:</span> {book.format}
            </div>
          )}
          {book.category && (
            <div>
              <Badge>{book.category}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
