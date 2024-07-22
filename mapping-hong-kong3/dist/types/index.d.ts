import { ControlPosition, IControl, Map as MaplibreMap } from 'maplibre-gl';
export interface LegendOptions {
    showDefault: boolean;
    showCheckbox: boolean;
    reverseOrder: boolean;
    onlyRendered: boolean;
    title?: string;
}
export declare class MaplibreLegendControl implements IControl {
    private controlContainer;
    private map?;
    private legendContainer;
    private legendButton;
    private closeButton;
    private legendTable;
    private targets;
    private uncheckedLayers;
    private onlyRendered;
    private options;
    private sprite;
    constructor(targets: {
        [key: string]: string;
    }, options: LegendOptions);
    getDefaultPosition(): ControlPosition;
    private createLayerCheckbox;
    private getLayerLegend;
    private updateLegendControl;
    onAdd(map: MaplibreMap): HTMLElement;
    onRemove(): void;
    redraw(): void;
    private onDocumentClick;
    private handleClickOnlyRendered;
    private setSprite;
    private loadImage;
    private loadJson;
}
//# sourceMappingURL=index.d.ts.map