import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity      } from 'react-native';

//informações(HTML) da calculadora
function App(){
  return(
    <View style={styles.container}>

      <StatusBar style="auto"/>


      //Título
      <Text style={styles.titulo}>Calculadora Profissional</Text>

      //visor
      <Text style={styles.painel}>
        0
      </Text>

       //primeira linha de botões 
      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textNumeros}>MRC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textNumeros}>M-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textNumeros}>M+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textNumeros}>√</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botao}>
          <Text style={styles.textNumeros}>OFF</Text>
        </TouchableOpacity>
      </View>

      //segunda linha de botões
      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>AC</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>+/-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          //text align aplicado alinhar ao centro o botão
          <Text style={[styles.textNumeros, {textAlign:'center'}]}>%</Text>
        </TouchableOpacity>
      </View>

      
      //terceira linha de botões
      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>9</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={[styles.textNumeros, {textAlign:'center'}]}>/</Text>
        </TouchableOpacity>
      </View>

      //quarta linha de botões
      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>6</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={[styles.textNumeros, {textAlign:'center'}]}>X</Text>
        </TouchableOpacity>
      </View>

      //quinta linha de botões
      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>3</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={[styles.textNumeros, {textAlign:'center'}]}>-</Text>
        </TouchableOpacity>
      </View>

      //sexta linha de botões
      <View style={styles.colunas}>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={styles.textNumeros}>=</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoNumeros}>
          <Text style={[styles.textNumeros, {textAlign:'center'}]}>+</Text>
        </TouchableOpacity>
      </View>

      //membros do grupo
      <Text style={[styles.textNumeros, {textAlign: 'left'}]}>Gabriel Antunes</Text>
      <Text style={[styles.textNumeros, {textAlign: 'left'}]}>João Pedro Santos</Text>
      <Text style={[styles.textNumeros, {textAlign: 'left'}]}>Luís Gustavo</Text>
      <Text style={[styles.textNumeros, {textAlign: 'left'}]}>Rafael</Text>
      <Text style={[styles.textNumeros, {textAlign: 'left'}]}>Túlio</Text>



    </View>
  )

}
export default App;

//Personalização(CSS) da calculadora
//style={styles."nome o atributo"} implementa a personalização
const styles = StyleSheet.create({
  container: {
    flex:1, 
    backgroundColor: "gray",
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop:40,
    padding:10
  },
  titulo: {
    textAlign: 'center',
    backgroundColor: 'white',
    color: 'Green',
    fontSize: 24,
    fontWeight: 'bold',
    height:35,
    width: '100%'
  },
  painel: {
    width: 100,
    textAlign: 'left',
    fontSize: 36,
    fontWeight: 'bold',
    backgroundColor: 'lightgray',
    borderColor: 'black',
    border: 3,
    padding: 10,
    marginBottom: 20
  },
  colunas: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 10
  },
  botao:{
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'gray',
    height: 50,
    padding: 10,
    marginTop: 20,
    width: '17%'
  },
  botaoNumeros: {
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'gray',
    height: 60,
    padding: 10,
    marginTop: 20,
    width: '25%'
  },
  textNumeros: {
    fontSize: 24,
    fontWeight: 'bold'
  }
})