import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import axios from 'axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RefreshControl } from 'react-native';
import {
  Box, Center, Stack, Button, HStack, VStack, Spacer, Avatar, FlatList, Text,
  Pressable,
} from 'native-base';

import { AuthContext } from '../context/AuthProvider';

type RootStackParamList = {
  CreateGame: undefined;
  PlayGame: { gameId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGame'>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useContext(AuthContext);

  const [games, setGames] = useState(null);
  const [loading, setLoading] = useState(false);

  const getMyOngoingGames = useCallback(() => {
    setLoading(true);
    axios({
      method: 'get',
      url: 'https://lichess.org/api/account/playing',
      headers: {
        Authorization: `Bearer ${user?.token.accessToken}`,
      },
    })
      .then((response) => {
        setGames(response.data.nowPlaying);
        setLoading(false);
      });
  }, [user?.token.accessToken]);

  useEffect(() => {
    if (games === null) {
      getMyOngoingGames();
    }
  }, [games, getMyOngoingGames]);

  const gameItem = ({ item }: { item: any }) => (
    <Pressable
      key={item.gameId}
      onPress={() => navigation.navigate('PlayGame', {
        gameId: item.gameId,
      })}
    >
      <Box pl="4" pr="5" py="5" _dark={{ bg: 'light.700' }}>
        <HStack space={3} justifyContent="space-between">
          <Avatar bg={item.color} size="48px" />
          <VStack>
            <Text bold>
              {item.opponent.username}
            </Text>
            <Text>
              {item.lastMove}
            </Text>
          </VStack>
          <Spacer />
          <Text fontSize="xs" alignSelf="flex-start">
            {item.gameId}
          </Text>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <>
      <FlatList
        data={games}
        renderItem={gameItem}
        keyExtractor={(item) => item.gameId}
        refreshControl={(
          <RefreshControl
            refreshing={loading}
            onRefresh={getMyOngoingGames}
          />
        )}
      />
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        py="3"
      >
        <Center>
          <Stack space={3} w="90%" maxW="400">
            <Button
              onPress={() => navigation.navigate('CreateGame')}
              colorScheme="amber"
              isLoading={loading}
            >
              NEW GAME
            </Button>
          </Stack>
        </Center>
      </Box>
    </>
  );
}
