import React from "react";
import { Box, Text } from "native-base";

export const WelcomeScreen = () => {
  return (
    <Box bg="gray.200" p={6} borderRadius="2xl" shadow={2} mx={5} mt={5}>
      <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
        Alohomora! 🔓 O Profeta Diário foi destrancado.
      </Text>
      <Text textAlign="center" color="gray.700" fontSize="lg">
        Explore os temas no menu e salve suas notícias preferidas, até você, um
        simples trouxa, consegue. 🤓 
      </Text>
    </Box>
  );
};
