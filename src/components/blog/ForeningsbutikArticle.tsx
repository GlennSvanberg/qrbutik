import { Link } from '@tanstack/react-router'
import { DEMO_SHOP_SLUG } from '~/lib/demo'
import { SKATTEVERKET_KASSAREGISTER_URL } from '~/lib/pricingFaq'

export function ForeningsbutikArticle() {
  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand-foreground">Vad en föreningsbutik online är</h2>
        <p>
          En föreningsbutik online är föreningens egen kanal för att sälja sådant som hör
          verksamheten till. Det kan vara kiosken vid planen, en enkel meny med fika, profilkläder
          inför säsongen, en cup där flera lag säljer samtidigt, eller en förbeställning så att
          korv och dryck är räknade innan publiken kommer. Köparen är oftast en förälder, en
          spelare eller en besökare. Betalningen ska hamna hos föreningen, inte hos ett
          plattformsbolag som tar emot Swish åt er.
        </p>
        <p>
          I en idrottsförening är det sällan en butik i ordets vanliga bemärkelse. Kassören vill
          veta vad som sålts. Den som står i kiosken vill slippa räkna totalsummor i huvudet när
          kön växer i pausen. Styrelsen vill att samma upplägg går att använda igen nästa helg,
          utan att någon bygger en ny prislista på ett papper.
        </p>
        <p>
          QRButik är byggt för det läget. Föreningen lägger in varor, skriver ut eller visar en
          QR-kod, och besökaren beställer på sin telefon. Pengarna går med Swish till föreningens
          eget nummer. Flera kiosker kan ligga under samma förening när planen tillåter det, till
          exempel en vid A-planen och en vid cupens servering.
        </p>
        <p>
          Samma grundidé syns i olika idrotter. En{' '}
          <Link to="/utforska/$sport" params={{ sport: 'fotboll' }} className="cursor-pointer font-semibold text-brand underline">
            fotbollsförening
          </Link>{' '}
          har ofta rusning i halvtid. En{' '}
          <Link to="/utforska/$sport" params={{ sport: 'ishockey' }} className="cursor-pointer font-semibold text-brand underline">
            ishockeyförening
          </Link>{' '}
          säljer mellan perioderna. En{' '}
          <Link to="/utforska/$sport" params={{ sport: 'handboll' }} className="cursor-pointer font-semibold text-brand underline">
            handbollsförening
          </Link>{' '}
          kan ha flera banor igång samma dag. Fler exempel finns under{' '}
          <Link to="/utforska" className="cursor-pointer font-semibold text-brand underline">
            Utforska
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand-foreground">Så fungerar QR och Swish</h2>
        <p>
          Besökaren behöver varken app eller konto. QR-koden på skylten öppnar kiosken i
          webbläsaren. Där väljer man varor, ser summan och betalar med Swish. Beloppet är redan
          ifyllt. Referensen följer med så att föreningen kan se vilket köp som hör till vilken
          betalning.
        </p>
        <p>
          Det är föreningens Swish-nummer som tar emot pengarna. QRButik står inte som mellanhand
          för kundernas betalningar. Den som sköter kiosken kan stå kvar vid disken och lämna ut
          varorna när ordern syns, i stället för att samtidigt ta emot kontanter och skriva en
          lapp.
        </p>
        <p>
          Förbeställning fungerar som samma meny, använd innan matchen. Publicera QR-koden i
          lagchatten eller på anslagstavlan och be folk beställa fika till en viss tid. Då vet
          kiosken ungefär hur många korvar som behövs, utan att ni lovar en exakt prognos. Under
          själva matchen använder ni samma kiosk för dem som handlar på plats.
        </p>
        <p>
          Profilprylar kan ligga i samma lista som fikan, med tydligt namn och pris. Håll listan
          kort på matchdagen. En lång meny tar tid när kön står stilla. Spara den längre listan
          till en cup där folk har mer tid, eller till en separat kiosk som bara säljer kläder.
        </p>
        <p>
          Vill ni se flödet innan ni skapar förening finns{' '}
          <Link
            to="/s/$shopSlug"
            params={{ shopSlug: DEMO_SHOP_SLUG }}
            className="cursor-pointer font-semibold text-brand underline"
          >
            demokiosken
          </Link>
          . Den visar hur en besökare väljer varor. Den är ett exempel, inte en riktig förenings
          försäljning.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand-foreground">Vad det kostar</h2>
        <p>
          Alla priser är inklusive 25 procent moms och gäller QRButik som tjänst, inte Swish-avgiften
          hos er bank. Gratis är standard: en kiosk, obegränsat antal produkter, Swish-QR och
          statistik för idag. En liten QRButik-märkning visas. Inget kort behövs.
        </p>
        <p>
          Event kostar 295 kronor och är ett engångsköp för ungefär en cuphelg. Då ingår flera
          kiosker, ingen märkning, försäljningsrapport och export i sju dagar. Därefter går
          föreningen tillbaka till Gratis. Säsong kostar 1&nbsp;495 kronor per år, cirka 125 kronor
          i månaden. Då ingår obegränsat antal kiosker så länge prenumerationen är aktiv, flera
          administratörer och bokföringsexport.
        </p>
        <p>
          Det finns ingen separat provperiod. Ni börjar på Gratis och köper Event eller Säsong när
          ni behöver mer. Aktuella planer står på{' '}
          <Link to="/priser" className="cursor-pointer font-semibold text-brand underline">
            prissidan
          </Link>
          .
        </p>
        <p>
          Räkna också med det som inte är QRButiks pris. Swish kan ha en avgift per betalning hos
          banken eller betaltjänsten. Den avgiften syns inte i QRButik. Varor, svinn och personal
          i kiosken är föreningens egen kalkyl. En digital meny tar inte bort behovet av att någon
          steker korven.
        </p>
        <p>
          Jämför planerna mot hur ofta ni säljer, inte mot en tänkt omsättning ni inte har mätt.
          En förening som har en kiosk på någon enstaka match klarar sig ofta på Gratis. En cup
          med flera försäljningsställen samma helg är det Event är till för. En förening som vill
          ha export och flera administratörer under hela säsongen tittar på Säsong. Ingen av
          planerna ändrar vem som äger Swish-numret.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand-foreground">Bokföring: filer, inte en direktkoppling</h2>
        <p>
          Kassören behöver underlag efter helgen. QRButik exporterar Excel och CSV för översikt,
          och en SIE4-fil som kan läsas in i ett bokföringsprogram, till exempel Fortnox eller
          Visma. Det finns ingen direktkoppling till de programmen. Någon i föreningen importerar
          filen, eller lämnar den till revisorn.
        </p>
        <p>
          CSV-filen är gjord för kalkylblad: semikolon mellan fälten, decimaltecken komma, datum
          som ÅÅÅÅ-MM-DD och UTF-8 med BOM så att å, ä och ö syns i Excel. SIE-filen är typ 4 och
          kodad som PC8. Varje verifierat köp blir ett verifikat där Swish-inbetalningen bokförs
          mot konto 1930 och försäljningen mot intäktskontot, som standard 3010. Organisationsnummer
          och konto anges i admin innan ni exporterar.
        </p>
        <p>
          Artiklarna i kiosken har ingen momssats. Därför delas beloppet inte upp på konton för
          utgående moms. Om föreningen behöver redovisa moms får kassören göra den fördelningen i
          bokföringsprogrammet. Väntande betalningar, som ännu inte är markerade som verifierade,
          tas inte med i SIE-filen.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand-foreground">Praktiskt på matchdagen</h2>
        <p>
          Sätt priserna dagen före och ta bort det som är slut. En QR-skylt vid kön, i ögonhöjd,
          räcker ofta. Ha föreningens Swish-nummer testat med ett litet köp så att ni vet att
          numret stämmer. Bestäm vem som tittar på orderlistan och vem som lämnar ut varorna, så
          att inte alla gör båda sakerna.
        </p>
        <p>
          Vid en cup: en kiosk per plats om avstånden är långa, samma varulista om det går, och en
          person som är kassör för dagen. Efter sista matchen exporterar ni underlaget medan
          minnet är färskt. Märk vilka köp som är verifierade mot Swish innan SIE-filen skapas.
        </p>
        <p>
          Håll menyn stabil under själva rusningen. Att ändra pris mitt i pausen skapar frågor i
          kön. Nya varor kan vänta till nästa period. Om nätet i hallen är svagt, prova QR-koden
          på plats innan publiken kommer. Telefonen behöver nå både kiosksidan och Swish.
        </p>
        <p>
          Skriv en kort lapp till dem som står i kiosken: var QR-koden sitter, vad som görs om en
          betalning inte syns, och vem som ringer kassören. En betalning som inte går att koppla
          till en order ska inte gissas i efterhand. Lägg den åt sidan och stäm av mot Swish-historiken
          när rusningen är över. Det är bättre än att verifiera ett köp ni inte känner igen.
        </p>
        <p>
          Efter matchen, räkna det som är kvar i kylen eller värmeskåpet och notera svinn för er
          egen skull. QRButik visar vad som beställts, inte vad som slängdes. Den skillnaden hör
          hemma i föreningens anteckningar, inte i en automatisk fil.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand-foreground">Kassaregisterkravet och 2027</h2>
        <p>
          Många frågar om kiosken kräver ett certifierat kassaregister. De flesta idrottsföreningar
          behöver inget certifierat kassaregister för den här typen av försäljning. Allmännyttiga
          ideella föreningar är undantagna från kassaregisterkravet när försäljningen är skattefri,
          till exempel enklare fika och kioskförsäljning vid matcher och evenemang.
        </p>
        <p>
          Undantaget gäller inte allt. Ett café som drivs året runt med anställd personal, eller en
          verksamhet som säljer för mer än fyra prisbasbelopp per år, kan behöva ett certifierat
          kassaregister. Fyra prisbasbelopp är 238&nbsp;400 kronor år 2027. Gränsen följer
          prisbasbeloppet och kan alltså vara en annan siffra ett annat år.
        </p>
        <p>
          Från den 1 januari 2027 tar övergångsperioden slut för äldre kassaregister. Reglerna om
          vem som måste ha ett certifierat kassaregister ändras inte av det. Det som ändras är
          vilka apparater som får användas av dem som redan omfattas av kravet.
        </p>
        <p>
          Swish räknas som en kortbetalning i de här reglerna. Att kunden swishar i stället för att
          betala med ett fysiskt kort gör alltså inte i sig att kravet försvinner, om föreningen
          annars omfattas av det.
        </p>
        <p>
          QRButik är inte ett certifierat kassaregister enligt skatteförfarandelagen. Tjänsten
          ersätter inte ett kassaregister och vi påstår inte att en viss förening uppfyller lagen.
          Föreningen ansvarar själv för bedömningen. Är ni osäkra, fråga er revisor eller
          Skatteverket. Skatteverket beskriver bokföring och kassaregister för ideella föreningar
          på sin sida om{' '}
          <a
            href={SKATTEVERKET_KASSAREGISTER_URL}
            className="cursor-pointer font-semibold text-brand underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            bokföring och kassaregister
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-brand-foreground">Så kommer ni igång</h2>
        <p>
          Bestäm vilken försäljning den första kiosken ska täcka: matchfika, cup eller en enkel
          lista med profilprylar. Lägg bara in varor ni faktiskt har. Skriv priset som kunden ska
          betala, inklusive den moms föreningen själv tillämpar. Sätt Swish-numret och skriv ut
          QR-koden.
        </p>
        <p>
          Låt två personer i styrelsen eller kiosken prova ett köp. Kontrollera att beloppet syns
          både i Swish och i QRButik. Bestäm vem som är kassör och vem som får exportera. När
          helgen är slut, ta ut CSV eller SIE och stäm av mot Swish innan filen går till
          bokföringen.
        </p>
        <p>
          Behöver ni fler kiosker samma helg är Event engångsköpet. Kör ni kiosk hela säsongen kan
          Säsong passa bättre. Gratis räcker för att prova en kiosk utan kort. Jämför planerna på{' '}
          <Link to="/priser" className="cursor-pointer font-semibold text-brand underline">
            prissidan
          </Link>{' '}
          och läs mer om upplägget för olika idrotter under{' '}
          <Link to="/utforska" className="cursor-pointer font-semibold text-brand underline">
            Utforska
          </Link>
          .
        </p>
      </section>
    </>
  )
}
