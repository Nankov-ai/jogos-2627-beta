// Café mais perto de cada campo (Google Maps, 18/10/2026): o mais próximo com pelo menos 10 avaliações.
// «m» = distância em linha reta, arredondada a 10 m. Pode ficar desatualizado se um café fechar.
window.CAFES = {
 "Campo Parque Jogos S J Brito": {
  "nome": "Páteo do Vieira",
  "morada": "R. Eugénio de Castro Rodrigues n° 1-b",
  "loc": "Lisboa",
  "m": 320
 },
 "Estádio Domingos Sávio | Estoril": {
  "nome": "Lucia’s Café",
  "morada": "Av. Sabóia 623B",
  "loc": "Estoril",
  "m": 460
 },
 "Campo das Salésias (Restelo)": {
  "nome": "Trullino | Specialty Coffee & Cowork",
  "morada": "Calçada da Boa Hora 105A",
  "loc": "Lisboa",
  "m": 250
 },
 "Estádio Municipal Dramático Cascais": {
  "nome": "Café Búzios",
  "morada": "Av. Dr. Manuel Ricardo Espírito Santo Silva 3 4",
  "loc": "Cascais",
  "m": 170
 },
 "Academia Jogador - Campo 1": {
  "nome": "Bitoke",
  "morada": "R. Vítor Cordon 3",
  "loc": "Odivelas",
  "m": 620,
  "dest": "Bitoke Espresso Bar, R. Vítor Cordon 3, 2675 Odivelas"
 },
 "Campo do Outeiro (Carenque)": {
  "nome": "Café Luar da Serra",
  "morada": "R. João L D Lopes 12A",
  "loc": "Amadora",
  "m": 470
 },
 "Complexo Desportivo Alto Lumiar - Campo 1": {
  "nome": "Café Gonçalves",
  "morada": "R. Tomás Del Negro 7A",
  "loc": "Lisboa",
  "m": 560
 },
 "Campo Colégio Marista": {
  "nome": "O Bacano",
  "morada": "R. Marques Leitão 31D",
  "loc": "Carcavelos",
  "m": 140
 },
 "Campo Colégio São João de Brito": {
  "nome": "Café Única da Torre",
  "morada": "Estr. da Torre 65A",
  "loc": "Lisboa",
  "m": 60
 },
 "Campo Abel Viegas Lopes (Fontainhas)": {
  "nome": "Calendário",
  "morada": "R. Furriel João Vieira 47",
  "loc": "Alcabideche",
  "m": 380
 },
 "Campo Nº2 Estádio Francisco Lázaro": {
  "nome": "Café da Mata",
  "morada": "R. Dr. José Alberto de Faria 1500",
  "loc": "Lisboa",
  "m": 170
 },
 "Campo Fernando Sabido": {
  "nome": "Café Miriam e Jonathan",
  "morada": "R. Antas 164",
  "loc": "São Domingos de Rana",
  "m": 120
 },
 "Campo de Futebol da Laje": {
  "nome": "Casa das Letras",
  "morada": "R. da Casa das Letras",
  "loc": "Porto Salvo",
  "m": 160
 },
 "Estádio Universitário de Lisboa (Campo 6)": {
  "nome": "Campus Point Café",
  "morada": "R. Paul Harris 3B",
  "loc": "Lisboa",
  "m": 300
 },
 "Campo 22 de Março": {
  "nome": "Cafe cervejaria Caracol",
  "morada": "R. de Cascais",
  "loc": "Alcabideche",
  "m": 1120
 },
 "Campo Da Lapa": {
  "nome": "Café Favorita, Lda.",
  "morada": "Largo Vieira Caldas 18",
  "loc": "Caneças",
  "m": 220
 },
 "Complexo Lúdico União D. R. Santa Maria": {
  "nome": "Estrela d'Alva",
  "morada": "R. Padre Américo Monteiro Aguiar",
  "loc": "Odivelas",
  "m": 70
 },
 "Campo Estoril AC (R. Vale Sta. Rita)": {
  "nome": "Carolina Sales Café - Estoril",
  "morada": "R. Biarritz 4B",
  "loc": "Estoril",
  "m": 350
 },
 "Parque Jogos Cer Tenente Valdez": {
  "nome": "O Cantinho",
  "morada": "R. da Liberdade",
  "loc": "Pontinha",
  "m": 890
 },
 "Complexo Desportivo da Abóboda": {
  "nome": "Aroma de Perdição",
  "morada": "R. da Escola 34",
  "loc": "São Domingos de Rana",
  "m": 210
 },
 "Campo Estrelas S J Brito": {
  "nome": "Páteo do Vieira",
  "morada": "R. Eugénio de Castro Rodrigues n° 1-b",
  "loc": "Lisboa",
  "m": 140
 },
 "Centro de Treino de Formação Desportiva N3": {
  "nome": "Café Auxiliadora",
  "morada": "R. Carlos Anjos 691A",
  "loc": "Estoril",
  "m": 200
 },
 "Campo Parque Urbano 25 Abril": {
  "nome": "Café do Desporto",
  "morada": "Rua de Bragança 1",
  "loc": "Casal de Cambra",
  "m": 50
 },
 "Campo do \"Decathlon Cascais\"": {
  "nome": "N&G coffee lab",
  "morada": "R. Carangueja 1 loja 2",
  "loc": "Alcabideche",
  "m": 450
 },
 "Complexo Desportivo Bairro Boavista": {
  "nome": "Café Cassiano",
  "morada": "R. Manuel Lemos Peixoto 8B",
  "loc": "Lisboa",
  "m": 650
 },
 "Campo de Futebol José Rodrigues": {
  "nome": "Timi-no.636 Cantinho da Mila",
  "morada": "R. Eugénio de Andrade 5",
  "loc": "Tires",
  "m": 250
 },
 "Campo do Vitória": {
  "nome": "Hábito Café",
  "morada": "R. Simões Telhadas",
  "loc": "Lisboa",
  "m": 460
 },
 "Campo Alfredo Pinheiro-BºTorre": {
  "nome": "Café Búzios",
  "morada": "Av. Dr. Manuel Ricardo Espírito Santo Silva 3 4",
  "loc": "Cascais",
  "m": 210
 },
 "Campo José Ramos": {
  "nome": "The Cup's Cafe & Snack Bar",
  "morada": "R. das Laranjeiras 47C",
  "loc": "Lisboa",
  "m": 270
 },
 "Campo Quinta Nova, Nº 2": {
  "nome": "Euphoria Specialty Coffee & Brunch - Carcavelos",
  "morada": "Av. Maria da Conceição 49A",
  "loc": "Carcavelos",
  "m": 430
 }
};
