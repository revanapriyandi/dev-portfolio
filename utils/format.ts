export const formatFileSizeDisplay = (value: number): string => {
    if (value < 1024) {
        return `${value} KB`;
    }
    return `${parseFloat((value / 1024).toFixed(1))} MB`;
};