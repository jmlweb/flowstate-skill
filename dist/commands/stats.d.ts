export interface BacklogStats {
    readonly pending: number;
    readonly active: number;
    readonly blocked: number;
    readonly complete: number;
}
export declare function stats(cwd: string): Promise<BacklogStats>;
