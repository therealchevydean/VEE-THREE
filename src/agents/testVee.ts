// testVee.ts
import { VeeAgent } from "./veeAgent"

const vee = new VeeAgent("VEE")

vee.enqueueTask({ type: "postToSocial", payload: { platform: "Twitter", content: "Hello world from VEE!" } })
vee.enqueueTask({ type: "createEbayListing", payload: { title: "V3 Token Hoodie", price: 49.99 } })
vee.enqueueTask({ type: "generateNFT", payload: { title: "Cosmic Flow", image: "cosmic.png" } })

vee.processNextTask()
vee.processNextTask()
vee.processNextTask()
