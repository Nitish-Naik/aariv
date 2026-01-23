// ⚠️ PREVIEW-ONLY ROUTE - Knowledge Graph Consent Screen
import { useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { KnowledgeGraphConsentScreen } from "../screens/KnowledgeGraphConsentScreen";
import { setKGConsent } from "../utils/kgConsent";

export default function KGConsentRoute() {
    const router = useRouter();

    const handleAccept = async () => {
        await setKGConsent(true);
        Alert.alert(
            "Consent Granted",
            "Knowledge graph is now enabled. You can view it from Settings.",
            [
                {
                    text: "View Knowledge Graph",
                    onPress: () => router.push("/knowledge-graph"),
                },
                {
                    text: "OK",
                    onPress: () => router.back(),
                },
            ]
        );
    };

    const handleDecline = () => {
        Alert.alert(
            "Consent Declined",
            "You can enable the knowledge graph later from Settings.",
            [{ text: "OK", onPress: () => router.back() }]
        );
    };

    return (
        <KnowledgeGraphConsentScreen
            onAccept={handleAccept}
            onDecline={handleDecline}
            onBack={() => router.back()}
        />
    );
}
