function validarPix() {
    const inputId = document.getElementById("pixIdInput").value.trim();
    const divResultado = document.getElementById("resultado");
    const regraPix = /^E[0-9]{8}[0-9]{12}[A-Za-z0-9]{11}$/;

    // Elementos da animação
    const animContainer = document.getElementById("animacao-container");
    const animPessoa = document.getElementById("anim-pessoa");
    const animPorta = document.getElementById("anim-porta");

    // 1. Prepara o palco para a nova animação
    animContainer.style.display = "flex"; // Mostra a caixinha no canto
    divResultado.style.display = "none";  // Esconde o resultado anterior (se houver)
    
    // Reseta as classes e a carinha do personagem
    animPessoa.className = "";
    animPorta.className = "";
    animPessoa.innerText = "🚶"; 
    
    // Pequeno truque de JS para forçar o reinício da animação
    void animPessoa.offsetWidth; 

    // 2. Ação! Personagem começa a caminhar até a porta
    animPessoa.classList.add("walk-to-door");

    // 3. Criamos um "suspense" de 1 segundo (tempo exato da caminhada)
    setTimeout(() => {
        divResultado.style.display = "block"; // Mostra a div de resultado na tela principal

        // Verifica se o campo tá vazio ou se violou a Integridade/Autenticidade
        if (inputId.length === 0 || !regraPix.test(inputId)) {
            
            // CENÁRIO DE FALHA (Código Inválido)
            divResultado.innerHTML = "❌ <strong>Código Inválido!</strong><br><br>Falha de integridade ou autenticidade.";
            divResultado.className = "invalido";
            
            // NOVO: Tiramos a instrução de andar para frente para ele poder recuar
            animPessoa.classList.remove("walk-to-door");
            
            // Animação: Bate na porta, volta uma casa e muda de cara
            animPessoa.classList.add("bump-door");
            animPessoa.innerText = "😵"; 

        } else {
            
            // CENÁRIO DE SUCESSO (Código Válido)
            divResultado.innerHTML = "✅ <strong>Transação Autenticada!</strong><br><br>Origem confirmada e código íntegro.";
            divResultado.className = "valido";
            
            // Animação: Porta abre e personagem atravessa
            animPorta.classList.add("door-open");
            animPessoa.classList.add("walk-through");
        }

        // Depois de 3 segundos, a caixinha de animação some para não poluir a tela
        setTimeout(() => {
            animContainer.style.display = "none";
        }, 3000);

    }, 1000); // 1000 ms = 1 segundo de "caminhada"
}

// Função ASSÍNCRONA para ler a imagem
async function lerComprovante(event) {
    const arquivo = event.target.files[0]; // Pega a imagem que o usuário subiu
    if (!arquivo) return;

    const divResultado = document.getElementById("resultado");
    const inputPix = document.getElementById("pixIdInput");

    // Mostra pro usuário que estamos processando (a leitura demora uns segundinhos)
    divResultado.style.display = "block";
    divResultado.className = "carregando";
    divResultado.innerHTML = "⏳ Lendo o comprovante com IA. Por favor, aguarde...";
    inputPix.value = ""; // Limpa o campo de texto

    try {
        // Chama o Tesseract.js para ler a imagem, configurado para português ('por')
        const resultadoOCR = await Tesseract.recognize(arquivo, 'por');
        
        // Pega todo o texto que a IA conseguiu extrair da imagem
        let textoExtraido = resultadoOCR.data.text;
        
        console.log("Texto que a IA leu:", textoExtraido); // Vai aparecer no Console (F12)

        // Limpeza: removemos todos os espaços e quebras de linha para facilitar a busca
        const textoLimpo = textoExtraido.replace(/\s+/g, '');

        // Usamos uma expressão regular (RegEx) para buscar o E2E ID dentro da bagunça de texto
        // Ela vai caçar exatamente o padrão: E + 8 números + 12 números + 11 letras/números
        const regexBusca = /(E[0-9]{8}[0-9]{12}[A-Za-z0-9]{11})/;
        const IDEncontrado = textoLimpo.match(regexBusca);

        if (IDEncontrado) {
            // Se encontrou, joga o ID limpo no campo de texto
            inputPix.value = IDEncontrado[0];
            
            // E automaticamente chama a NOSSA função de validação de Integridade/Autenticidade!
            validarPix();
        } else {
            // Se a IA não achou nada parecido com um Pix ID
            divResultado.innerHTML = "❌ Não foi possível localizar um ID Pix legível neste comprovante.";
            divResultado.className = "invalido";
        }

    } catch (erro) {
        console.error(erro);
        divResultado.innerHTML = "❌ Ocorreu um erro ao tentar ler a imagem.";
        divResultado.className = "invalido";
    }
}