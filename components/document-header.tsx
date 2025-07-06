interface DocumentHeaderProps {
    title: string;
    description?: string;
    size?: 'large' | 'medium';
}

export function DocumentHeader({ title, description, size = 'medium' }: DocumentHeaderProps) {
    return (
        <div className="space-y-2">
            <h1 className={size === 'large' ? 'text-4xl font-bold' : 'text-3xl font-bold'}>
                {title}
            </h1>
            {description && (
                <p className={`text-muted-foreground ${size === 'large' ? 'text-xl' : 'text-lg'}`}>
                    {description}
                </p>
            )}
        </div>
    );
} 