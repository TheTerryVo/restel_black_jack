import java.util.Random;
import java.util.Scanner;

public class SeventySix {

    public static void main(String[] args) {

        Scanner keyboard = new Scanner(System.in);

        //52 Cards, Aces = 11, Picture cards = 10, Ace's cannot be reduced to 1.
        int[] newCard = {1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10};

        //Shuffle. Once per game.
        shuffleArray(newCard);

        //Start BlackJack.
        System.out.println("Welcome to BlackJack!");
        System.out.println();
        System.out.println("You get a " + newCard[0] + " and a " + newCard[1] + ".");
        int playerTotal = newCard[0] + newCard[1];
        System.out.println("Your total is " + playerTotal + ".");
        System.out.println();

        //Player can get blackjack/bust in the 1st deal. - awaiting betting system (enhanced bets for blackjack in first round)
        if (playerTotal == 21){
            System.out.println("Blackjack, you win.");
            System.exit(0);
        }
        if (playerTotal > 21){
            System.out.println("Bust, You lose.");
            System.exit(0);
        }
        // Dealer cards
        System.out.println("The dealer has a " + newCard[2] + " showing, and a hidden card.");
        int dealerTotal = newCard[2] + newCard[3];
        if (dealerTotal > 21){     //Dealer bust check.
            System.out.println();
            System.out.println("Dealers total is " + dealerTotal + ".");
            System.out.println("Dealer is bust, you win!");
            System.exit(0);
        }
        if (dealerTotal == 21){    //Dealer blackjack check.
            System.out.println();
            System.out.println("Dealer reveals his second card: " + newCard[3] + ".");
            System.out.println("Dealers total is " + dealerTotal + ".");
            System.out.println();
            System.out.println("Dealer has BlackJack, you lose.");
            System.exit(0);
        }
        System.out.println("His total is hidden.");
        System.out.println();
        System.out.println();
        System.out.println("Dealer total is " + dealerTotal);
        System.out.println("Your total is " + playerTotal);
        System.out.println();

        if (dealerTotal > playerTotal){
            System.out.println("Dealer wins.");
        } 
        if (dealerTotal == playerTotal){
            System.out.println("You both draw.");
        }
        if (dealerTotal < playerTotal){
            System.out.println("You win.");
        }    
    }
    
    static void shuffleArray(int[] deckCards){

      
        Random rnd = new Random();
        for (int i = deckCards.length - 1; i > 0; i--)
        {
            int index = rnd.nextInt(i + 1);
            // Swap
            int a = deckCards[index];
            deckCards[index] = deckCards[i];
            deckCards[i] = a;
        }
    }

}

