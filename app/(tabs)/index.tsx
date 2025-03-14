import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, TextInput, Text, Image, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const botAvatar = require('../../assets/images/botavatar.jpg');
const kimyImage = require('../../assets/images/kimyimage.jpg');
const placeholderImage = require('../../assets/images/avatarplaceholder.jpg');

const App = () => {
  const [isSettings, setIsSettings] = useState(false);
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([ 
    { id: 1, text: '¡Hola! ¿En qué puedo ayudarte hoy?', sender: 'bot', timestamp: new Date() },
  ]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedImage = await AsyncStorage.getItem('userImage');
      console.log("Datos cargados desde AsyncStorage:", savedUsername, savedImage);
      if (savedUsername) setUsername(savedUsername);
      if (savedImage) setImage(savedImage);
    };
    loadData();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);  // Establece la imagen seleccionada
      console.log("Imagen seleccionada:", result.assets[0].uri);
    }
  };

  const saveSettings = async () => {
    if (username.trim()) {
      await AsyncStorage.setItem('username', username);
      if (image) {
        await AsyncStorage.setItem('userImage', image); 
        console.log("Imagen guardada en AsyncStorage:", image);
      }
      Alert.alert('Configuración guardada', '¡Tus cambios se han guardado correctamente!');
    } else {
      Alert.alert('Error', 'Por favor, ingresa un nombre de usuario.');
    }
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      const userMessage = { id: messages.length + 1, text: messageText, sender: 'user', timestamp: new Date() };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessageText('');

      let botResponse = '';
      if (messageText.toLowerCase().includes('hola')) {
        botResponse = ¡Hola ${username || 'usuario'}! ¿En qué puedo ayudarte hoy?;
      } else if (messageText.toLowerCase().includes('adiós')) {
        botResponse = Adiós ${username || 'usuario'}! Espero que hablemos pronto.;
      } else {
        botResponse = 'Lo siento, no puedo entenderte. ¿En qué puedo ayudarte?';
      }

      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            text: botResponse,
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }, 1000);
    }
  };

  const resetMessages = () => {
    setMessages([ 
      { id: 1, text: ¡Hola ${username || 'usuario'}! ¿En qué puedo ayudarte hoy?, sender: 'bot', timestamp: new Date() },
    ]);
  };

  const toggleScreen = () => {
    setIsSettings(!isSettings);
  };

  const formatDate = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const isToday = now.toDateString() === date.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
    const options = { day: '2-digit', month: 'long' };
    const dateString = new Intl.DateTimeFormat('es-ES', options).format(date);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes();
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const timeString = ${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm};

    if (isToday) return Hoy;
    if (isYesterday) return Ayer;
    return ${dateString};
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes();
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return ${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm};
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={kimyImage} style={styles.backgroundImage} />
      {isSettings ? (
        <View style={styles.settingsContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleScreen}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Ajustes</Text>
          </View>

          <View style={styles.profileContainer}>
            <Image source={image ? { uri: image } : placeholderImage} style={styles.profileImage} />
            <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
              <Ionicons name="pencil" size={20} color="#0078FF" />
            </TouchableOpacity>
            <View style={styles.usernameContainer}>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Ingresa tu nombre de usuario"
                placeholderTextColor="#888"
              />
            </View>
          </View>

          <TouchableOpacity onPress={saveSettings} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.chatContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image source={botAvatar} style={styles.avatar} />
              <Text style={styles.headerText}>Kimy.IA</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={resetMessages} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reiniciar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleScreen} style={styles.settingsButton}>
                <Ionicons name="settings" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(messages[messages.length - 1].timestamp)}</Text>
          </View>

          <ScrollView style={styles.messagesContainer}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={message.sender === 'bot' ? styles.botMessage : styles.userMessage}
              >
                <View style={styles.messageHeader}>
                  {message.sender === 'bot' ? (
                    <Image source={botAvatar} style={styles.avatar} />
                  ) : (
                    <Image source={image ? { uri: image } : placeholderImage} style={styles.avatar} />
                  )}
                  <Text style={styles.messageSender}>
                    {message.sender === 'bot' ? 'Kimy.IA' : username || 'Usuario'}
                  </Text>
                </View>
                <Text style={styles.messageText}>{message.text}</Text>
                <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputMessage}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Escribe un mensaje"
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  settingsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2C1C1C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#0078FF',
    padding: 5,
    borderRadius: 10,
    marginRight: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 5,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 50,
    right: 100,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  usernameContainer: {
    marginTop: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#0078FF',
    padding: 10,
    borderRadius: 10,
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#0078FF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  messageSender: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 5,
  },
  messageTime: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
  },
  botMessage: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#0078FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  inputMessage: {
    flex: 1,
    backgroundColor: '#fff',
    color: '#000',
    padding: 10,
    borderRadius: 10,
  },
  sendButton: {
    backgroundColor: '#0078FF',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
});

export default App;