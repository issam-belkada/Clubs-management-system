"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const categories = [
  "Art & Culture",
  "Technology",
  "Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Robotics",
  "AI & Machine Learning",
  "Sports",
  "Music",
  "Literature",
  "Others",
];

export default function RecommendedPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setSelected((prev: string[]) =>
      prev.includes(cat)
        ? prev.filter((c: string) => c !== cat)
        : [...prev, cat]
    );
  };

  const handleNext = () => {
    console.log("Selected categories:", selected);
    // Navigate or save to backend
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-center">Recommended For You</h1>
      <p className="text-center text-gray-600">
        Select your interests to personalize event recommendations
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <motion.div
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleCategory(cat)}
          >
            <Card
              className={`cursor-pointer 2xl rounded-xl p-2 shadow-md transition border-2 text-center ${
                selected.includes(cat)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <CardContent className="p-4 font-medium">{cat}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button
          disabled={selected.length === 0}
          onClick={handleNext}
          className="px-6 py-2 text-lg rounded-2xl shadow-md"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
