import type { Construct } from "constructs";
import type { SsrSiteProps } from "sst/constructs/SsrSite";
import { RemixSite } from "sst/constructs";
export interface WarmRemixSiteProps extends SsrSiteProps {
    /**
     * The number of server functions to keep warm. This option is only supported for the reginal mode.
     */
    warm?: number;
}
export declare class WarmRemixSite extends RemixSite {
    protected warm?: number;
    constructor(scope: Construct, id: string, { warm, ...props }: WarmRemixSiteProps);
    private createWarmer;
}
