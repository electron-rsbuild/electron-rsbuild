
export interface ExistingRawSourceMap {
	file?: string;
	mappings: string;
	names: string[];
	sourceRoot?: string;
	sources: string[];
	sourcesContent?: string[];
	version: number;
	x_google_ignoreList?: number[];
}

export type SourceMapInput = ExistingRawSourceMap | string | null | { mappings: '' };
