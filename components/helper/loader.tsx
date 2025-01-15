"use client";
import React from "react";
import { MultiStepLoader as Loader } from "../ui/multi-step-loader";

const loadingStates = [
    {
        text: "Preparing the portfolio...",
    },
    {
        text: "Loading personal details...",
    },
    {
        text: "Highlighting experience...",
    },
    {
        text: "Gathering skills data...",
    },
    {
        text: "Compiling projects...",
    },
    {
        text: "Fetching education history...",
    },
    {
        text: "Loading repositories...",
    },
    {
        text: "Almost there...",
    },
    {
        text: "Welcome to my portfolio!",
    },
];

interface MultiStepLoaderProps {
    initialLoading: boolean;
}

export function MultiStepLoader({ initialLoading }: MultiStepLoaderProps) {
    return (
        <div className="w-full h-[60vh] flex items-center justify-center">
            <Loader loadingStates={loadingStates} loading={initialLoading} duration={200} />
        </div>
    );
}
