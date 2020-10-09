import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, Linking, View, ActivityIndicator, ScrollView, FlatList, SafeAreaView } from 'react-native';

import moment from 'moment';
import { Card, Button, Icon } from 'react-native-elements';

const NEWS_API_KEY = '8a08908873c84a8eaa44960100f8c276';

const onPress = url => {
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log(`Don't know how to open URL: ${url}`);
    }
  });
};


const ArticleCounter = ({ value }) => {
  return (
    <Text style={styles.articleCounter}>Article Count: {value}</Text>
  );
}

const filterForUniqueArticles = arr => {
  const cleaned = [];
  arr.forEach(itm => {
    let unique = true;
    cleaned.forEach(itm2 => {
      const isEqual = JSON.stringify(itm) === JSON.stringify(itm2);
      if (isEqual) unique = false;
    });
    if (unique) cleaned.push(itm);
  });
  return cleaned;
};

const getArticles = async (pageNumber) => {
  console.log('pageNumber: ', pageNumber);
  const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}&page=${pageNumber}`;
  // const url = `https://wrongapi.com`;
  try{
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
  catch(error){
    return null;
  }
}

const renderArticleItem = ({ item }) => {
  return (
    <Card>
      <Card.Title>{item.title}</Card.Title>
      <Card.Image source={{uri: item.urlToImage }}></Card.Image>
      <View style={styles.row}>
        <Text style={styles.label}>Source</Text>
        <Text style={styles.info}>{item.source.name}</Text>
      </View>
      <Text style={{ marginBottom: 10 }}>{item.content}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Published</Text>
        <Text style={styles.info}>
          {moment(item.publishedAt).format('LLL')}
        </Text>
      </View>
      <Button icon={<Icon />} title="Read more" backgroundColor="#03A9F4" onPress={() => onPress(item.url)} />
    </Card>
  )
}

export default class App extends React.Component {
  constructor(props){
    super();

    this.state = {
      loading: true,
      pageNumber: 1,
      articles: [],
      error: false,
      lastPageReached: false,
    };
  }

  getContinuousArticles = () => {
    if(this.state.articles.length > 100 || this.state.pageNumber > 5){
      this.setState({lastPageReached: true});
      console.log('Last page has been reached !');
      return;
    }
    this.setState({loading: true});
    getArticles(this.state.pageNumber).then((data) => {

      if(data === null){
        this.setState({loading: false, error: true});
        return;
      }

      let new_articles = this.state.articles.concat(data.articles);
      // this.setState({articles: filterForUniqueArticles(new_articles)});
      this.setState({articles: new_articles});
      this.setState({loading: false});
      this.setState({pageNumber: this.state.pageNumber + 1});

      console.log('article length: ', this.state.articles.length);
    }).catch((error) => {
      this.setState({error: true, loading: false});
    });
  }

  componentDidMount(){
    this.getContinuousArticles();
  }

  render(){
    console.log('re-render');
    // const articles = this.state.articles;
    if(this.state.error){
      return (
        <SafeAreaView style={styles.container}>
          <Text>Has Error !</Text>
        </SafeAreaView>
      )
    }
    if(this.state.loading){
      return (
        <SafeAreaView style={styles.container}>
          <ArticleCounter value={this.state.articles.length}/>
          <View styles={styles.contentContainer}>
            <ActivityIndicator size="large" color="#0000ff"/>
          </View>
        </SafeAreaView>
      )
    }
    return (
      <SafeAreaView style={styles.container}>
        <ArticleCounter value={this.state.articles.length}/>
        <FlatList
          data={this.state.articles}
          renderItem={renderArticleItem}
          keyExtractor={item => item.title}
          onEndReached={this.getContinuousArticles}
          onEndReachedThreshold={1}
          ListFooterComponent={this.state.lastPageReached ? <Text style={{textAlign: "center", }}>No more articles to read !</Text> : <ActivityIndicator
            size="large"
            loading={this.state.loading}
          />}
        />

        
        
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  containerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    height: 30,
    width: '100%',
    backgroundColor: 'pink'
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
    width: 80,
    fontWeight: 'bold'
  },
  info: {
    fontSize: 16,
    color: 'grey'
  },
  contentContainer: {
    backgroundColor: 'yellow',
  },
  articleCounter: {
    fontSize: 16,
    padding: 10,
    width: '100%',
    textAlign: "center",
  }
});
