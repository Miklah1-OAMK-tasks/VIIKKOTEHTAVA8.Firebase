import { StyleSheet, Text, TextInput, View, Button, SafeAreaView, ScrollView } from 'react-native';
import { collection, addDoc, firestore, MESSAGES, serverTimestamp } from './firebase/Config';
import { useState, useEffect } from 'react';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import Constants from 'expo-constants';
import { convertFirebaseTimestampToJS } from './helpers/Functions';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [logged, setLogged] = useState(false);

  const save = async () => {
    const docRef = await addDoc(collection(firestore, MESSAGES), {
      text: newMessage,
      created: serverTimestamp()
    }).catch(e => console.log(e))
    setNewMessage('')
    console.log('Message saved.')
  }

  useEffect(() => {
    const q = query(collection(firestore, MESSAGES), orderBy('created', 'desc'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tempMessages = []

      querySnapshot.forEach((doc) => {
        const messageObject = {
          id: doc.id,
          text: doc.data().text,
          created: convertFirebaseTimestampToJS(doc.data().created)
        }
        tempMessages.push(messageObject)
      })
      setMessages(tempMessages)
    })

    return () => {
      unsubscribe()
    }
  }, [])


    return (
      <SafeAreaView style={styles.container}>       
        <ScrollView>
          {
            messages.map((message) => (
              <View style={styles.message} key={message.id}>
                <Text style={styles.messageInfo}>{message.created}</Text>
                <Text>{message.text}</Text>
              </View>
            ))
          }
        </ScrollView>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
          <TextInput style={{ flex: 0.75 }} placeholder='Send a message...' value={newMessage} onChangeText={text => setNewMessage(text)} />
          <Button style={{ flex: 0.25 }} title='Send' type='button' onPress={save} />
        </View>
      </SafeAreaView>
    );
  }


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Constants.statudBarHeight,
  },
  message: {
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#eee',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  messageInfo: {
    color: '#666',
    marginBottom: 5,
    fontSize: 12,
  }
});
