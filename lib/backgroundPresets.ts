export interface BackgroundPreset {
    id: string;
    name: string;
    gradient: string;
    config?: {
        overlayIntensity?: number;
        noise?: boolean;
        stars?: boolean;
        waves?: boolean;
        particles?: boolean;
        grain?: boolean;
        glow?: boolean;
        blur?: boolean;
    };
}

export const backgroundPresets: BackgroundPreset[] = [
    {
        id: 'deep-space',
        name: 'Deep Space',
        gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        config: { particles: true }
    },
    {
        id: 'aurora-flow',
        name: 'Aurora Flow',
        gradient: 'linear-gradient(135deg, #4500FF, #0098FF, #00F2FF)',
        config: { waves: true }
    },
    {
        id: 'crimson-pulse',
        name: 'Crimson Pulse',
        gradient: 'linear-gradient(135deg, #000000, #BA0000, #FF0000)',
        config: { glow: true }
    },
    {
        id: 'cyber-lime',
        name: 'Cyber Lime',
        gradient: 'linear-gradient(135deg, #000000, #00FF0B)',
        config: { noise: true }
    },
    {
        id: 'neon-blend',
        name: 'Neon Blend',
        gradient: 'linear-gradient(135deg, #FF02EE, #4500FF, #0098FF)',
        config: { blur: true }
    },
    {
        id: 'solar-energy',
        name: 'Solar Energy',
        gradient: 'linear-gradient(135deg, #FDFF01, #FF7F02)',
        config: { grain: true }
    },
    {
        id: 'pure-dark-luxury',
        name: 'Pure Dark Luxury',
        gradient: 'linear-gradient(180deg, #000000, #121212)',
        config: { grain: true }
    },
    {
        id: 'pure-light-premium',
        name: 'Pure Light Premium',
        gradient: 'linear-gradient(180deg, #FFFFFF, #F3F3F3)',
        config: { glow: true }
    },
    {
        id: 'ocean-depth',
        name: 'Ocean Depth',
        gradient: 'linear-gradient(135deg, #001f3f, #0074D9)',
        config: { glow: true }
    },
    {
        id: 'hyperwave',
        name: 'Hyperwave',
        gradient: 'linear-gradient(135deg, #9900FF, #FF035A, #FF0000)',
        config: { glow: true }
    },
    {
        id: 'acid-matrix',
        name: 'Acid Matrix',
        gradient: 'linear-gradient(135deg, #000000, #C7FF00)',
        config: { noise: true }
    },
    {
        id: 'ice-glass',
        name: 'Ice Glass',
        gradient: 'linear-gradient(135deg, #E0F7FF, #00F2FF)',
        config: { blur: true }
    },
    {
        id: 'ruby-fade',
        name: 'Ruby Fade',
        gradient: 'linear-gradient(135deg, #FFFFFF, #FF035A)',
        config: { blur: true }
    },
    {
        id: 'inferno-soft',
        name: 'Inferno Soft',
        gradient: 'linear-gradient(135deg, #1a0000, #FF7F02)',
        config: { glow: true }
    },
    {
        id: 'galaxy-night',
        name: 'Galaxy Night',
        gradient: 'linear-gradient(135deg, #000000, #4500FF)',
        config: { stars: true }
    }
];
