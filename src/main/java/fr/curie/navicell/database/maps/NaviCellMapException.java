package fr.curie.navicell.database.maps;

public class NaviCellMapException extends Exception {
    public NaviCellMapException(String message) {
        super(message);
        System.err.println("Exception : " + message);

    }
}