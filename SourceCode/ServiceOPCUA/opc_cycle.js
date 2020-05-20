const endpointUrl = "opc.tcp://solution.phuctruong.net:4335";

const opcua = require("node-opcua");
const AttributeIds = opcua.AttributeIds;
const OPCUAClient = opcua.OPCUAClient;

(async function main(){

    const client = new OPCUAClient({});
    await client.connect(endpointUrl);
    const session = await client.createSession({userName: "user1", password: "password1"});

    const dataValue = await session.read({nodeId: "ns=1;s=tag1",attributeId: AttributeIds.Value});
    console.log(`Temperature is ${dataValue.value.value.toPrecision(3)}°C.`);

    await client.closeSession(session,true);
    await client.disconnect();

})();