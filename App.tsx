import {
    ClientBuilder,
    CreateRoomParameters,
    MessageType,
    RoomPreset,
    RoomVisibility_Tags,
} from '@unomed/react-native-matrix-sdk';
import * as React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const [homeserver, setHomeserver] = React.useState("https://matrix.unredacted.org");
  const [status, setStatus] = React.useState("");

  const updateHomeserverLoginDetails = React.useCallback(async () => {
    if (!homeserver.length) {
      setStatus("");
      return;
    }

    try {
      const client = await (new ClientBuilder()).homeserverUrl(homeserver).build(); 
      const loginDetails = await client.homeserverLoginDetails();

      // --- login ---
      await client.login("@shilpa123:unredacted.org", "", "My Device", undefined);

      const session = client.session();
      console.log("userId:", session.userId);
      console.log("deviceId:", session.deviceId);

      // --- start sync service ---
    //   const syncService = await  client.syncService().finish();
    //   await syncService.start();

      // --- create a room ---
      const params = CreateRoomParameters.new({
        name: 'hello',
        isEncrypted: false,
        visibility: { tag: RoomVisibility_Tags.Private },
        preset: RoomPreset.PrivateChat,
      });
      const roomId = await client.createRoom(params);
      console.log("Room created:", roomId);

      await client.joinRoomById(roomId);
      const room = client.rooms().find(r => r.id() === roomId);
      if (!room) throw new Error("Room not found after creation!");

      // --- invite another user ---
      await room.inviteUserById("@test123:unredacted.org");
      

      // --- watch membership + send message when joined ---
      const checkAndSendMessage = async () => {
        const member = await room.member("@test123:unredacted.org");
        if (member ) {
          console.log("User joined, sending message...");

          const timeline = await room.timeline();
          const textType = MessageType.Text.new({ content: { body: "Hello Matrix!" , formatted: undefined } });

          const content =   timeline.createMessageContent(textType);
        // you can still update after
        if (!content) {
            throw new Error("Could not create message content for Text");
          }
          
          await timeline.send(content);  // ✅ now safe
          console.log("✅ Message sent!");

        } else {
          console.log("User has not joined yet, retrying...");
          setTimeout(checkAndSendMessage, 5000); // check again in 5s
        }
      };

      checkAndSendMessage();

      setStatus(
        `url: ${loginDetails.url()}\n`
        + `supportsOidcLogin: ${loginDetails.supportsOidcLogin()}\n`
        + `supportsPasswordLogin: ${loginDetails.supportsPasswordLogin()}`
      );
    } catch (error) {
      console.error(error);
      setStatus(`${error}`);
    }
  }, [homeserver]);

  return (
    <View style={styles.container}>
      <TextInput value={homeserver} onChangeText={setHomeserver} />
      <Button title='Go' onPress={updateHomeserverLoginDetails} />
      <Text>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
