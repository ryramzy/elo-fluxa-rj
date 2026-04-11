import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sobre: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-8">
            M
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Sobre Matt</h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Professor nativo de inglês americano vivendo no Rio de Janeiro, apaixonado por ensinar o inglês real que você vai usar na vida.
          </p>
        </div>
      </section>

      {/* Matt's Story */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Minha História</h2>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Olá! Sou Matt, um professor nativo de inglês americano que encontrou um lar no Rio de Janeiro. 
              Minha jornada começou nos Estados Unidos, onde cresci falando o inglês que você ouve nas ruas, 
              nos escritórios, e nas conversas do dia a dia - não o inglês dos livros didáticos.
            </p>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Quando me mudei para o Brasil, percebi que muitos brasileiros estudam inglês por anos 
              mas ainda travam quando precisam usar o idioma em situações reais. Vi a necessidade de ensinar 
              o inglês americano autêntico - o que realmente funciona em entrevistas de emprego, reuniões 
              de negócios, e conversas cotidianas.
            </p>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Hoje, com mais de uma década de experiência ensinando profissionais, estudantes e entusiastas 
              da cultura americana, desenvolvi um método que vai além da gramática. Eu ensino o inglês que 
              abre portas, que constrói confiança, e que conecta pessoas através da comunicação real.
            </p>
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Minha Filosofia de Ensino</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-3xl mb-4">??</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Cultura Primeiro</h3>
              <p className="text-slate-600">
                A língua não existe isolada da cultura. Ensino inglês através do contexto cultural americano, 
                para que você entenda não apenas o que dizer, mas também quando e como dizer.
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-3xl mb-4">??</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Língua Segundo</h3>
              <p className="text-slate-600">
                A gramática e o vocabulário seguem naturalmente quando você entende o contexto cultural. 
                Foco na comunicação real, não em regras abstratas que você nunca usará.
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-3xl mb-4">??</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Prática Constante</h3>
              <p className="text-slate-600">
                A fluência vem da prática consistente em situações reais. Aulas ao vivo, simulações, 
                e feedback imediato para construir confiança rapidamente.
              </p>
            </div>
            
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-3xl mb-4">??</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Inglês Autêntico</h3>
              <p className="text-slate-600">
                Sem inglês "escolar" ou artificial. Ensino o idioma que americanos realmente usam, 
                com gírias, expressões idiomáticas, e o jeito natural de se comunicar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Overview */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Nossos Cursos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-slate-900 mb-2">Business English</h3>
              <p className="text-sm text-slate-600">Para profissionais que precisam dominar o inglês corporativo americano.</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-slate-900 mb-2">Sports English</h3>
              <p className="text-sm text-slate-600">Para fãs que querem entender basquete, futebol americano e a cultura esportiva.</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-slate-900 mb-2">Hip Hop Culture</h3>
              <p className="text-sm text-slate-600">Para entusiastas da cultura americana e música que querem entender as raízes do inglês moderno.</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-slate-900 mb-2">Medical English</h3>
              <p className="text-sm text-slate-600">Para profissionais de saúde que precisam comunicar-se em inglês médico.</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-slate-900 mb-2">Study Abroad</h3>
              <p className="text-sm text-slate-600">Para estudantes que vão fazer intercâmbio ou precisam passar em exames de proficiência.</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="text-3xl mb-3">??</div>
              <h3 className="font-semibold text-slate-900 mb-2">Law Enforcement</h3>
              <p className="text-sm text-slate-600">Para profissionais da área de segurança que trabalham com sistemas americanos.</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Ver Todos os Cursos
            </button>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Tem dúvidas? Me manda uma mensagem!</h2>
          <p className="text-xl mb-8 opacity-90">
            Adoro conversar sobre inglês, cultura americana, e como posso ajudar você a alcançar seus objetivos.
          </p>
          <a
            href="https://wa.me/5521999999999?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20as%20aulas%20de%20ingl%C3%AAs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.028 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
            </svg>
            Falar com Matt no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default Sobre;
