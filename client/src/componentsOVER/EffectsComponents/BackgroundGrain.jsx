export default function BackgroundGrain() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: "url('/images/background-grain.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '128px', // O tamanho da "tile" da imagem do granulado
        opacity: 0.06, // A opacidade sutil do efeito de granulado
        zIndex: 0, // Garante que esteja acima da cor de fundo, mas abaixo do conteúdo principal
        pointerEvents: 'none', // Impede que este div interfira com cliques ou interações
      }}
    ></div>
  );
}