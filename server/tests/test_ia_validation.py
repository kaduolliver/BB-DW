import json
import unittest
from unittest.mock import patch
from app.services.proposal_services import processar_avaliacao_ia

class TestIntegracaoIA(unittest.TestCase):
    """
    Classe de testes unitários para validar a resiliência do backend
    contra respostas inválidas da Inteligência Artificial.
    """
    def test_resposta_ia_com_sucesso(self):
        """
        Valida o fluxo feliz: quando a IA respeita o prompt e envia um JSON
        limpo.
        """
        resposta_perfeita = '{"relevancia": 8, "justificativa": "Excelente proposta técnica para o evento."}'
        resultado = processar_avaliacao_ia("Tema A", "Descricao A", resposta_perfeita)
        self.assertEqual(resultado["relevancia"], 8)
        self.assertEqual(resultado["justificativa"], "Excelente proposta técnica para o evento.")

    def test_resposta_ia_com_falha_de_markdown(self):
        """
        Valida se o backend trata corretamente o cenário real de falha (Prompt
        Antigo) onde a IA envelopava a resposta em tags markdown de código.
        """
        resposta_com_falha = '```json\n{"relevancia": 7, "justificativa": "Boa proposta."}\n```'
        resultado = processar_avaliacao_ia("Tema B", "Descricao B", resposta_com_falha)
        
        self.assertEqual(resultado["relevancia"], 0)
        self.assertTrue("Falha no parsing" in resultado["justificativa"])

    def test_resposta_ia_vazia_ou_invalida(self):
        """
        Valida se o backend se comporta de forma segura caso a API de IA
        retorne texto simples.
        """
        resposta_texto_simples = "Desculpe, ocorreu um erro ao processar a sua mensagem."
        resultado = processar_avaliacao_ia("Tema C", "Descricao C", resposta_texto_simples)
        
        self.assertEqual(resultado["relevancia"], 0)
        self.assertEqual(resultado["justificativa"], "Falha no parsing da resposta automatizada devido a formato inválido.")

if __name__ == "__main__":
    print("Iniciando testes unitários de integração de IA no backend...")
    unittest.main()
